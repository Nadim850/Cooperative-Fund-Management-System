public with sharing class familyController {
  @AuraEnabled(cacheable=true)
  public static List<Family__c> FindFamily(String key) {
    String Query = '%' + key + '%';

    List<List<Family__c>> result = [
      FIND :Query
      IN ALL FIELDS
      RETURNING Family__c(Name, Member__c)
    ];
    return result.size() > 0 ? result[0] : new List<Family__c>();
  }

  @AuraEnabled(cacheable=true)
  public static List<Family__c> getFamily() {
    return [SELECT Name, Id, Member__c FROM Family__c];
  }

  @AuraEnabled
  public static void delFamily(String familyId) {
    try {
      List<Family__c> family = [
        SELECT Id, Name
        FROM Family__c
        WHERE Id = :familyId
      ];
      if (!family.isEmpty()) {
        delete family;
      }
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static String delMultiFamilies(List<Id> familyIds) {
    try {
      List<Family__c> familyList = [
        SELECT Id
        FROM Family__c
        WHERE Id IN :familyIds
      ];
      delete familyList;
      return 'Family and related data deleted successfully';
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<Member__c> getMembersByFamilyId(Id familyId) {
    return [
      SELECT Id, Name, Address__c, Family__c, Email__c
      FROM Member__c
      WHERE Family__c = :familyId
    ];
  }
}
