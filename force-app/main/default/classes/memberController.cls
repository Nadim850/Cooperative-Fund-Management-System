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
    return [SELECT Id, Name FROM Member__c];
  }

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
}
