public with sharing class controller {
  @AuraEnabled(cacheable=true)
  public static List<Family__c> FindFamily(String key) {
    String Query = '%' + key + '%';

    List<List<Family__c>> result = [
      FIND :Query
      IN ALL FIELDS
      RETURNING Family__c(Name, Head_Of_Family__c, Member__c)
    ];
    return result.size() > 0 ? result[0] : new List<Family__c>();
  }

  @AuraEnabled(cacheable=true)
  public static List<Family__c> getFamily() {
    return [SELECT Name, Id, Head_Of_Family__c, Member__c FROM Family__c];
  }
}
