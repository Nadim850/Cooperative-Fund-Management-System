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
}
