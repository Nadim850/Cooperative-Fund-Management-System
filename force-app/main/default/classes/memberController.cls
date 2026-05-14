public with sharing class memberController {
  @AuraEnabled(cacheable=true)
  public static List<Member__c> findMember(String key) {
    String Query = '%' + key + '%';

    List<Member__c> result = [
      SELECT Id, Name
      FROM Member__c
      WHERE Name LIKE :Query
    ];

    return result;
  }
  @AuraEnabled(cacheable=true)
  public static List<Member__c> getMember() {
    return [SELECT Id, Name, Email__c, Phone__c, Address_c, Total_Contribution__c FROM Member__c WHERE Id =:memberId];
  },

  @AuraEnabled
  public static void delMember(String memberId) {
    try {
      List<Member__c> member = [
        SELECT Id, Name
        FROM Member__c
        WHERE Id = :memberId
      ];
      if (!member.isEmpty()) {
        delete member;
      }
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
  @AuraEnabled
  public static String delMultiMember(List<Id> memberIds) {
    try {
      List<Member__c> memberList = [
        SELECT Id
        FROM Member__c
        WHERE Id IN :memberIds
      ];
      delete memberList;
      return 'Member and related data deleted successfully';
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  //check contribution validation
  @AuraEnabled
  public static Boolean checkMonthlyContributions (Id memberId) {

    List<Transaction__c> transactions = [
       SELECT Id
        FROM Transaction__c
        WHERE Member__c = :memberId
        AND Type__c = 'Contribution'
        AND CALENDAR_MONTH(CreatedDate) = :System.today().month()
        AND CALENDAR_YEAR(CreatedDate) = :System.today().year()
        LIMIT 1
    ];
    return transactions.size() > 0;
  }
}
