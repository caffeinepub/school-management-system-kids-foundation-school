import AccessControl "authorization/access-control";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import Text "mo:core/Text";
import Time "mo:core/Time";

actor {
  type AdmissionNumber = Text;
  type ClassName = Text;
  type StaffId = Principal;
  type Month = Text;
  type ClassStats = { className : ClassName; studentCount : Nat };

  type MonthlyPaymentRecord = {
    var january : Nat;
    var february : Nat;
    var march : Nat;
    var april : Nat;
    var may : Nat;
    var june : Nat;
    var july : Nat;
    var august : Nat;
    var september : Nat;
    var october : Nat;
    var november : Nat;
    var december : Nat;
  };

  public type Gender = {
    #male;
    #female;
    #other;
  };

  public type StudentAdmissionPersist = {
    studentName : Text;
    fatherName : Text;
    motherName : Text;
    fatherAadhaarNumber : Text;
    motherAadhaarNumber : Text;
    admittedClass : ClassName;
    aadhaarNumber : Text;
    phoneNumber : Text;
    admissionDate : Time.Time;
    admissionAmount : Nat;
    admissionNumber : AdmissionNumber;
    photo : ?Storage.ExternalBlob;
    address : Text;
    gender : Gender;
    dateOfBirth : Time.Time;
    isFreeStudent : Bool;
  };

  public type StudentAdmissionPure = {
    studentName : Text;
    fatherName : Text;
    motherName : Text;
    fatherAadhaarNumber : Text;
    motherAadhaarNumber : Text;
    admittedClass : ClassName;
    aadhaarNumber : Text;
    phoneNumber : Text;
    admissionDate : Time.Time;
    admissionAmount : Nat;
    admissionNumber : AdmissionNumber;
    address : Text;
    photo : ?Storage.ExternalBlob;
    gender : Gender;
    dateOfBirth : Time.Time;
    isFreeStudent : Bool;
  };

  public type FeeRecordPersist = {
    var studentAdmission : StudentAdmissionPersist;
    var paidMonths : List.List<Month>;
    var monthlyPayments : MonthlyPaymentRecord;
  };

  public type FeeRecordPure = {
    studentAdmission : StudentAdmissionPure;
    paidMonths : [Month];
    monthlyPayments : MonthlyPaymentPure;
  };

  public type MonthlyPaymentPure = {
    january : Nat;
    february : Nat;
    march : Nat;
    april : Nat;
    may : Nat;
    june : Nat;
    july : Nat;
    august : Nat;
    september : Nat;
    october : Nat;
    november : Nat;
    december : Nat;
  };

  public type StaffProfilePersist = {
    assignedClasses : List.List<ClassName>;
  };

  public type AdminProfilePersist = {
    name : Text;
  };

  public type UserProfilePersist = {
    #staff : StaffProfilePersist;
    #admin : AdminProfilePersist;
  };

  public type StaffProfilePure = {
    assignedClasses : [ClassName];
  };

  public type AdminProfilePure = {
    name : Text;
  };

  public type UserProfilePure = {
    #staff : StaffProfilePure;
    #admin : AdminProfilePure;
  };

  public type PendingFeeRecord = {
    admissionNumber : AdmissionNumber;
    studentName : Text;
    className : ClassName;
    month : Month;
    paymentStatus : Bool;
  };

  public type TotalAmountRecord = {
    className : ClassName;
    admissionFeesTotal : Nat;
    monthlyFeesTotal : Nat;
    grandTotal : Nat;
  };

  public type FeeExportRecord = {
    studentName : Text;
    fatherName : Text;
    motherName : Text;
    parentContactNumber : Text;
    completeAddress : Text;
    admissionNumber : AdmissionNumber;
    className : ClassName;
    month : Month;
    feeType : Text;
    amountPaid : Nat;
    paymentDate : ?Text;
    paymentMode : ?Text;
    paymentStatus : Bool;
  };

  func toUserProfilePure(profile : UserProfilePersist) : UserProfilePure {
    switch (profile) {
      case (#staff(staffProfile)) {
        #staff {
          assignedClasses = staffProfile.assignedClasses.toArray();
        };
      };
      case (#admin(adminProfile)) {
        #admin {
          name = adminProfile.name;
        };
      };
    };
  };

  func toFeeRecordPure(record : FeeRecordPersist) : FeeRecordPure {
    {
      studentAdmission = toStudentAdmissionPure(record.studentAdmission);
      paidMonths = record.paidMonths.toArray();
      monthlyPayments = toMonthlyPaymentPure(record.monthlyPayments);
    };
  };

  func toMonthlyPaymentPure(monthlyPayments : MonthlyPaymentRecord) : MonthlyPaymentPure {
    {
      january = monthlyPayments.january;
      february = monthlyPayments.february;
      march = monthlyPayments.march;
      april = monthlyPayments.april;
      may = monthlyPayments.may;
      june = monthlyPayments.june;
      july = monthlyPayments.july;
      august = monthlyPayments.august;
      september = monthlyPayments.september;
      october = monthlyPayments.october;
      november = monthlyPayments.november;
      december = monthlyPayments.december;
    };
  };

  func toStudentAdmissionPure(admission : StudentAdmissionPersist) : StudentAdmissionPure {
    {
      studentName = admission.studentName;
      fatherName = admission.fatherName;
      motherName = admission.motherName;
      fatherAadhaarNumber = admission.fatherAadhaarNumber;
      motherAadhaarNumber = admission.motherAadhaarNumber;
      admittedClass = admission.admittedClass;
      aadhaarNumber = admission.aadhaarNumber;
      phoneNumber = admission.phoneNumber;
      admissionDate = admission.admissionDate;
      admissionAmount = admission.admissionAmount;
      admissionNumber = admission.admissionNumber;
      address = admission.address;
      gender = admission.gender;
      dateOfBirth = admission.dateOfBirth;
      photo = admission.photo;
      isFreeStudent = admission.isFreeStudent;
    };
  };

  func isMonthPaid(paidMonths : List.List<Month>, month : Month) : Bool {
    for (paidMonth in paidMonths.values()) {
      if (paidMonth == month) {
        return true;
      };
    };
    false;
  };

  var feeRecords : Map.Map<AdmissionNumber, FeeRecordPersist> = Map.empty<AdmissionNumber, FeeRecordPersist>();
  var lastAdmissionNumber : Nat = 0;
  let userProfiles = Map.empty<StaffId, UserProfilePersist>();

  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({
    caller
  }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfilePure {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller).map(toUserProfilePure);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfilePure {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user).map(toUserProfilePure);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfilePure) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (profile) {
      case (#staff(staffProfile)) {
        let persistProfile : UserProfilePersist = #staff {
          assignedClasses = List.fromArray(staffProfile.assignedClasses);
        };
        userProfiles.add(caller, persistProfile);
      };
      case (#admin(adminProfile)) {
        let persistProfile : UserProfilePersist = #admin {
          name = adminProfile.name;
        };
        userProfiles.add(caller, persistProfile);
      };
    };
  };

  func staffHasClassAccess(staffId : Principal, className : ClassName) : Bool {
    switch (userProfiles.get(staffId)) {
      case (?profile) {
        switch (profile) {
          case (#staff(staffProfile)) {
            for (c in staffProfile.assignedClasses.values()) {
              if (c == className) {
                return true;
              };
            };
            false;
          };
          case (#admin(_)) { true };
        };
      };
      case (null) { false };
    };
  };

  func getStaffAssignedClasses(staffId : Principal) : [ClassName] {
    switch (userProfiles.get(staffId)) {
      case (?profile) {
        switch (profile) {
          case (#staff(staffProfile)) {
            staffProfile.assignedClasses.toArray();
          };
          case (#admin(_)) { [] };
        };
      };
      case (null) { [] };
    };
  };

  public shared ({
    caller
  }) func createStaffAccount(staffPrincipal : Principal, assignedClasses : [ClassName]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create staff accounts");
    };

    AccessControl.assignRole(accessControlState, caller, staffPrincipal, #user);

    let staffProfile : UserProfilePersist = #staff {
      assignedClasses = List.fromArray(assignedClasses);
    };
    userProfiles.add(staffPrincipal, staffProfile);
  };

  func generateAdmissionNumber() : AdmissionNumber {
    lastAdmissionNumber += 1;
    "KDS/ADM/" # lastAdmissionNumber.toText();
  };

  public shared ({
    caller
  }) func addAdmissionRecord(admission : StudentAdmissionPure) : async AdmissionNumber {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can add admissions");
    };

    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (not staffHasClassAccess(caller, admission.admittedClass)) {
        Runtime.trap("Unauthorized: Staff can only add admissions to assigned classes");
      };
    };

    let admissionNumber = generateAdmissionNumber();

    switch (feeRecords.get(admissionNumber)) {
      case (?_) { Runtime.trap("Duplicate admission number generated: " # admissionNumber) };
      case (null) {};
    };

    let newMonthlyPayments : MonthlyPaymentRecord = {
      var january = 0;
      var february = 0;
      var march = 0;
      var april = 0;
      var may = 0;
      var june = 0;
      var july = 0;
      var august = 0;
      var september = 0;
      var october = 0;
      var november = 0;
      var december = 0;
    };

    let newRecord : FeeRecordPersist = {
      var studentAdmission = {
        studentName = admission.studentName;
        fatherName = admission.fatherName;
        motherName = admission.motherName;
        fatherAadhaarNumber = admission.fatherAadhaarNumber;
        motherAadhaarNumber = admission.motherAadhaarNumber;
        admittedClass = admission.admittedClass;
        aadhaarNumber = admission.aadhaarNumber;
        phoneNumber = admission.phoneNumber;
        admissionDate = admission.admissionDate;
        admissionAmount = admission.admissionAmount;
        admissionNumber;
        photo = admission.photo;
        address = admission.address;
        gender = admission.gender;
        dateOfBirth = admission.dateOfBirth;
        isFreeStudent = admission.isFreeStudent;
      };
      var paidMonths = List.empty<Month>();
      var monthlyPayments = newMonthlyPayments;
    };

    feeRecords.add(admissionNumber, newRecord);
    admissionNumber;
  };

  public shared ({
    caller
  }) func updateStudentRecord(admissionNumber : AdmissionNumber, updatedAdmission : StudentAdmissionPure) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can update student records");
    };

    switch (feeRecords.get(admissionNumber)) {
      case (?record) {
        if (not AccessControl.isAdmin(accessControlState, caller) and not staffHasClassAccess(caller, record.studentAdmission.admittedClass)) {
          Runtime.trap("Unauthorized: Staff can only update records for assigned classes");
        };

        record.studentAdmission := {
          studentName = updatedAdmission.studentName;
          fatherName = updatedAdmission.fatherName;
          motherName = updatedAdmission.motherName;
          fatherAadhaarNumber = updatedAdmission.fatherAadhaarNumber;
          motherAadhaarNumber = updatedAdmission.motherAadhaarNumber;
          admittedClass = updatedAdmission.admittedClass;
          aadhaarNumber = updatedAdmission.aadhaarNumber;
          phoneNumber = updatedAdmission.phoneNumber;
          admissionDate = updatedAdmission.admissionDate;
          admissionAmount = updatedAdmission.admissionAmount;
          admissionNumber;
          photo = updatedAdmission.photo;
          address = updatedAdmission.address;
          gender = updatedAdmission.gender;
          dateOfBirth = updatedAdmission.dateOfBirth;
          isFreeStudent = updatedAdmission.isFreeStudent;
        };
      };
      case (null) {
        Runtime.trap("Student record not found for update");
      };
    };
  };

  public shared ({ caller }) func deleteStudentRecord(admissionNumber : AdmissionNumber) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can delete student records");
    };

    switch (feeRecords.get(admissionNumber)) {
      case (?record) {
        if (not AccessControl.isAdmin(accessControlState, caller) and not staffHasClassAccess(caller, record.studentAdmission.admittedClass)) {
          Runtime.trap("Unauthorized: Staff can only delete records for assigned classes");
        };
        feeRecords.remove(admissionNumber);
      };
      case (null) {
        Runtime.trap("Student record not found for deletion");
      };
    };
  };

  public query ({
    caller
  }) func getAdmission(admissionNumber : AdmissionNumber) : async StudentAdmissionPure {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can view admissions");
    };

    switch (feeRecords.get(admissionNumber)) {
      case (?record) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          if (not staffHasClassAccess(caller, record.studentAdmission.admittedClass)) {
            Runtime.trap("Unauthorized: Staff can only view admissions from assigned classes");
          };
        };
        toStudentAdmissionPure(record.studentAdmission);
      };
      case (null) { Runtime.trap("Admission not found") };
    };
  };

  public query ({
    caller
  }) func getClassAdmissions(className : ClassName) : async [StudentAdmissionPure] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can view class admissions");
    };

    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (not staffHasClassAccess(caller, className)) {
        Runtime.trap("Unauthorized: Staff can only view assigned classes");
      };
    };

    feeRecords.values().filter(
      func(record) {
        record.studentAdmission.admittedClass == className
      }
    ).map<FeeRecordPersist, StudentAdmissionPure>(
      func(record) { toStudentAdmissionPure(record.studentAdmission) }
    ).toArray();
  };

  public type MonthlyPayments = {
    january : Nat;
    february : Nat;
    march : Nat;
    april : Nat;
    may : Nat;
    june : Nat;
    july : Nat;
    august : Nat;
    september : Nat;
    october : Nat;
    november : Nat;
    december : Nat;
  };

  public shared ({
    caller
  }) func markMonthPaid(admissionNumber : AdmissionNumber, month : Month) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can mark payments");
    };

    switch (feeRecords.get(admissionNumber)) {
      case (?record) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          if (not staffHasClassAccess(caller, record.studentAdmission.admittedClass)) {
            Runtime.trap("Unauthorized: Staff can only mark payments for assigned classes");
          };
        };
        record.paidMonths.add(month);
      };
      case (null) { Runtime.trap("Admission record not found") };
    };
  };

  public shared ({
    caller
  }) func markMonthlyPayments(admissionNumber : AdmissionNumber, payments : MonthlyPayments) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can update payments");
    };

    switch (feeRecords.get(admissionNumber)) {
      case (?record) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          if (not staffHasClassAccess(caller, record.studentAdmission.admittedClass)) {
            Runtime.trap("Unauthorized: Staff can only update payments for assigned classes");
          };
        };

        func checkAndMarkPayment(amount : Nat, month : Text) {
          if (amount > 0) {
            record.paidMonths.add(month);
          };
        };

        let monthsList = [
          ("january", payments.january),
          ("february", payments.february),
          ("march", payments.march),
          ("april", payments.april),
          ("may", payments.may),
          ("june", payments.june),
          ("july", payments.july),
          ("august", payments.august),
          ("september", payments.september),
          ("october", payments.october),
          ("november", payments.november),
          ("december", payments.december),
        ];

        for ((monthText, amount) in monthsList.values()) {
          checkAndMarkPayment(amount, monthText);
        };

        let updatedRecord : FeeRecordPersist = {
          var studentAdmission = record.studentAdmission;
          var paidMonths = record.paidMonths;
          var monthlyPayments = {
            var january = payments.january;
            var february = payments.february;
            var march = payments.march;
            var april = payments.april;
            var may = payments.may;
            var june = payments.june;
            var july = payments.july;
            var august = payments.august;
            var september = payments.september;
            var october = payments.october;
            var november = payments.november;
            var december = payments.december;
          };
        };
        feeRecords.add(admissionNumber, updatedRecord);
      };
      case (null) { Runtime.trap("Admission record not found") };
    };
  };

  public query ({
    caller
  }) func getFeeStatus(className : ClassName) : async [FeeRecordPure] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can view fee status");
    };

    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (not staffHasClassAccess(caller, className)) {
        Runtime.trap("Unauthorized: Staff can only view fee status for assigned classes");
      };
    };

    feeRecords.values().filter(
      func(record) {
        let classMatch = record.studentAdmission.admittedClass == className;
        let hasAccess = if (AccessControl.isAdmin(accessControlState, caller)) {
          true;
        } else {
          staffHasClassAccess(caller, record.studentAdmission.admittedClass);
        };
        classMatch and hasAccess;
      }
    ).map<FeeRecordPersist, FeeRecordPure>(
      func(record) { toFeeRecordPure(record) }
    ).toArray();
  };

  public query ({
    caller
  }) func getPredefinedClassOptions() : async [ClassName] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can view class options");
    };

    if (AccessControl.isAdmin(accessControlState, caller)) {
      [
        "NUR",
        "LKG",
        "UKG",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
      ];
    } else {
      getStaffAssignedClasses(caller);
    };
  };

  public query ({
    caller
  }) func searchStudent(searchQuery : Text) : async [StudentAdmissionPure] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can search students");
    };

    // TODO Lowercase search

    feeRecords.values().filter(
      func(record) {
        let a = record.studentAdmission;

        let matchesSearchQuery = a.studentName.contains(#text searchQuery) or
          a.fatherName.contains(#text searchQuery) or
          a.motherName.contains(#text searchQuery) or
          a.fatherAadhaarNumber.contains(#text searchQuery) or
          a.motherAadhaarNumber.contains(#text searchQuery) or
          a.admittedClass.contains(#text searchQuery) or
          a.aadhaarNumber.contains(#text searchQuery) or
          a.phoneNumber.contains(#text searchQuery) or
          a.admissionNumber.contains(#text searchQuery);

        let hasAccess = if (AccessControl.isAdmin(accessControlState, caller)) {
          true;
        } else {
          staffHasClassAccess(caller, a.admittedClass);
        };

        matchesSearchQuery and hasAccess;
      }
    ).map<FeeRecordPersist, StudentAdmissionPure>(
      func(record) { toStudentAdmissionPure(record.studentAdmission) }
    ).toArray();
  };

  public query ({
    caller
  }) func getStudentStatsByClass() : async {
    classStats : [ClassStats];
    totalStudents : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can view student statistics");
    };

    let classesToShow = if (AccessControl.isAdmin(accessControlState, caller)) {
      ["NUR", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    } else {
      getStaffAssignedClasses(caller);
    };

    let accessibleAdmissions = feeRecords.values().filter(
      func(record) {
        if (AccessControl.isAdmin(accessControlState, caller)) {
          true;
        } else {
          staffHasClassAccess(caller, record.studentAdmission.admittedClass);
        };
      }
    );

    let statsArray = classesToShow.map(
      func(className) {
        let count = accessibleAdmissions.filter(
          func(record) {
            record.studentAdmission.admittedClass == className
          },
        ).size();
        { className; studentCount = count };
      }
    );

    let totalCount = accessibleAdmissions.size();

    {
      classStats = statsArray;
      totalStudents = totalCount;
    };
  };

  public query ({
    caller
  }) func getStudentFeeRecord(admissionNumber : AdmissionNumber) : async FeeRecordPure {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can access fee records");
    };

    switch (feeRecords.get(admissionNumber)) {
      case (?record) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          let hasAccess = staffHasClassAccess(caller, record.studentAdmission.admittedClass);
          if (not hasAccess) {
            Runtime.trap("Unauthorized: Staff can only access fee records for assigned classes");
          };
        };
        toFeeRecordPure(record);
      };
      case (null) { Runtime.trap("Fee record not found") };
    };
  };

  public query ({ caller }) func getGenderOptions() : async [Gender] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff and admin can access gender options");
    };
    [
      #male,
      #female,
      #other,
    ];
  };

  public query ({ caller }) func getPendingFeesReport(month : Month, className : ?ClassName) : async [PendingFeeRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access pending fees report");
    };

    func matchesClassName(record : FeeRecordPersist, filterClassName : ?ClassName) : Bool {
      let recordClass = record.studentAdmission.admittedClass;
      switch (filterClassName) {
        case (?c) {
          if (c.trim(#char ' ').toLower() == "all classes") {
            return true;
          } else {
            return recordClass == c;
          };
        };
        case (null) {
          return true;
        };
      };
    };

    feeRecords.values().filter(
      func(record) {
        not record.studentAdmission.isFreeStudent and not isMonthPaid(record.paidMonths, month) and matchesClassName(record, className)
      }
    ).map<FeeRecordPersist, PendingFeeRecord>(
      func(record) {
        {
          admissionNumber = record.studentAdmission.admissionNumber;
          studentName = record.studentAdmission.studentName;
          className = record.studentAdmission.admittedClass;
          month;
          paymentStatus = false;
        };
      }
    ).toArray();
  };

  public query ({ caller }) func getAllStudentData() : async [StudentAdmissionPersist] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access all student data export");
    };

    feeRecords.values().map<FeeRecordPersist, StudentAdmissionPersist>(
      func(record) { record.studentAdmission }
    ).toArray();
  };

  func normalizeClassName(className : ClassName) : ClassName {
    let lower = className.toLower();
    if (lower == "nursery" or lower == "nur") { "NUR" } else if (lower == "lkg") {
      "LKG";
    } else if (lower == "ukg") { "UKG" } else { className };
  };

  public query ({ caller }) func getClassStudentData(className : ClassName) : async [StudentAdmissionPersist] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access class student data export");
    };

    let normalizedClass = normalizeClassName(className);

    feeRecords.values().filter(
      func(record) {
        normalizeClassName(record.studentAdmission.admittedClass) == normalizedClass
      }
    ).map<FeeRecordPersist, StudentAdmissionPersist>(
      func(record) { record.studentAdmission }
    ).toArray();
  };

  public query ({ caller }) func getTotalAmountCollection() : async {
    classTotals : [TotalAmountRecord];
    grandTotals : TotalAmountRecord;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access total amount collection");
    };

    let allClasses = [
      "NUR",
      "LKG",
      "UKG",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
    ];

    let classTotals = allClasses.map(
      func(className) {
        let classAdmissions = feeRecords.values().filter(
          func(record) { record.studentAdmission.admittedClass == className }
        );

        let admissionFeesTotal = classAdmissions.foldLeft(
          0,
          func(sum, record) { sum + record.studentAdmission.admissionAmount },
        );

        let monthlyFeesTotal = classAdmissions.foldLeft(
          0,
          func(sum, record) {
            if (record.studentAdmission.isFreeStudent) {
              sum;
            } else {
              sum + calculateMonthlyFeesTotal(record);
            };
          },
        );

        let grandTotal = admissionFeesTotal + monthlyFeesTotal;

        {
          className;
          admissionFeesTotal;
          monthlyFeesTotal;
          grandTotal;
        };
      }
    );

    let grandAdmissionFeesTotal = classTotals.foldLeft(
      0,
      func(sum, classTotal) { sum + classTotal.admissionFeesTotal },
    );

    let grandMonthlyFeesTotal = classTotals.foldLeft(
      0,
      func(sum, classTotal) { sum + classTotal.monthlyFeesTotal },
    );

    let grandGrandTotal = grandAdmissionFeesTotal + grandMonthlyFeesTotal;

    let grandTotals = {
      className = "Grand Total";
      admissionFeesTotal = grandAdmissionFeesTotal;
      monthlyFeesTotal = grandMonthlyFeesTotal;
      grandTotal = grandGrandTotal;
    };

    {
      classTotals;
      grandTotals;
    };
  };

  func calculateMonthlyFeesTotal(record : FeeRecordPersist) : Nat {
    let payments = record.monthlyPayments;
    payments.january + payments.february + payments.march + payments.april + payments.may +
    payments.june + payments.july + payments.august + payments.september +
    payments.october + payments.november + payments.december;
  };

  public query ({ caller }) func getMonthlyFeeAlerts() : async [PendingFeeRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access monthly fee alerts");
    };

    let currentTime = Time.now();
    let currentMonth = getCurrentMonth(currentTime);
    let currentDay = getCurrentDay(currentTime);

    if (currentDay > 10) {
      return [];
    };

    feeRecords.values().foldLeft(
      List.empty<PendingFeeRecord>(),
      func(alerts, record) {
        if (not record.studentAdmission.isFreeStudent and not isMonthPaid(record.paidMonths, currentMonth)) {
          let alert : PendingFeeRecord = {
            admissionNumber = record.studentAdmission.admissionNumber;
            studentName = record.studentAdmission.studentName;
            className = record.studentAdmission.admittedClass;
            month = currentMonth;
            paymentStatus = false;
          };
          let newAlerts = alerts.clone();
          newAlerts.add(alert);
          newAlerts;
        } else { alerts };
      },
    ).toArray();
  };

  func getCurrentMonth(timestamp : Time.Time) : Text {
    let nanosecondsPerSecond = 1_000_000_000 : Int;
    let seconds = timestamp / nanosecondsPerSecond;
    let daysSinceEpoch = seconds / 86_400;
    let daysInYear = 365;

    let dayOfYear = (daysSinceEpoch % daysInYear) + 1;

    let daysPerMonth = [
      31 : Nat,
      28 : Nat,
      31 : Nat,
      30 : Nat,
      31 : Nat,
      30 : Nat,
      31 : Nat,
      31 : Nat,
      30 : Nat,
      31 : Nat,
      30 : Nat,
      31 : Nat,
    ];

    var remainingDays = dayOfYear;
    var currentMonth = 0;

    while (currentMonth < daysPerMonth.size() and remainingDays > daysPerMonth[currentMonth]) {
      remainingDays -= daysPerMonth[currentMonth];
      currentMonth += 1;
    };

    let monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    if (currentMonth >= 1 and currentMonth <= monthNames.size()) {
      monthNames[currentMonth - 1];
    } else { "unknown" };
  };

  func getCurrentDay(timestamp : Time.Time) : Int {
    let nanosecondsPerSecond = 1_000_000_000 : Int;
    let seconds = timestamp / nanosecondsPerSecond;
    let daysSinceEpoch = seconds / 86_400;
    let daysInYear = 365;

    let dayOfYear = (daysSinceEpoch % daysInYear) + 1;

    let daysPerMonth = [
      31 : Nat,
      28 : Nat,
      31 : Nat,
      30 : Nat,
      31 : Nat,
      30 : Nat,
      31 : Nat,
      31 : Nat,
      30 : Nat,
      31 : Nat,
      30 : Nat,
      31 : Nat,
    ];

    var remainingDays = dayOfYear;
    var currentMonth = 1;

    while (currentMonth <= daysPerMonth.size() and remainingDays > daysPerMonth[currentMonth - 1]) {
      remainingDays -= daysPerMonth[currentMonth - 1];
      currentMonth += 1;
    };

    remainingDays;
  };

  // Fee export logic, deprecated, only used for old data migration.
  public shared ({ caller }) func getAllFeesData() : async [FeeExportRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access all fees data export");
    };
    [];
  };

  public shared ({ caller }) func getClassFeesData(className : ClassName) : async [FeeExportRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access class fees data export");
    };
    [];
  };

  type ClassWiseFeesExportRecord = {
    studentName : Text;
    fatherName : Text;
    motherName : Text;
    admissionNumber : AdmissionNumber;
    className : ClassName;
    parentContactNumber : Text;
    completeAddress : Text;
    feeMonth : Month;
    amountPaid : Nat;
    paymentStatus : Bool;
  };

  func toClassWiseExportRecord(feeRecord : FeeRecordPersist) : [ClassWiseFeesExportRecord] {
    let payments = feeRecord.monthlyPayments;
    let months = [
      ("january", payments.january),
      ("february", payments.february),
      ("march", payments.march),
      ("april", payments.april),
      ("may", payments.may),
      ("june", payments.june),
      ("july", payments.july),
      ("august", payments.august),
      ("september", payments.september),
      ("october", payments.october),
      ("november", payments.november),
      ("december", payments.december),
    ];

    let records = months.map(
      func((month, amount)) {
        {
          studentName = feeRecord.studentAdmission.studentName;
          fatherName = feeRecord.studentAdmission.fatherName;
          motherName = feeRecord.studentAdmission.motherName;
          admissionNumber = feeRecord.studentAdmission.admissionNumber;
          className = feeRecord.studentAdmission.admittedClass;
          parentContactNumber = feeRecord.studentAdmission.phoneNumber;
          completeAddress = feeRecord.studentAdmission.address;
          feeMonth = month;
          amountPaid = amount;
          paymentStatus = amount > 0;
        };
      }
    );
    records;
  };

  public shared ({ caller }) func getClassWiseFeesData(className : ClassName) : async [ClassWiseFeesExportRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access class-wise fees export");
    };

    let normalizedClass = normalizeClassName(className);

    let filteredRecords = feeRecords.values().filter(
      func(record) {
        normalizeClassName(record.studentAdmission.admittedClass) == normalizedClass
      }
    );

    let exportRecords = filteredRecords.foldLeft(
      List.empty<ClassWiseFeesExportRecord>(),
      func(acc, feeRecord) {
        let recordList = toClassWiseExportRecord(feeRecord);
        for (record in recordList.values()) {
          acc.add(record);
        };
        acc;
      },
    );

    exportRecords.toArray();
  };

  public query ({ caller }) func getFreeStudentsData() : async [StudentAdmissionPersist] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can access free students report");
    };

    feeRecords.values().filter(
      func(record) { record.studentAdmission.isFreeStudent }
    ).map<FeeRecordPersist, StudentAdmissionPersist>(
      func(record) { record.studentAdmission }
    ).toArray();
  };
};
