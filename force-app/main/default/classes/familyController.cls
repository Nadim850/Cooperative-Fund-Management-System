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
    return [SELECT Id, Name, Head__c, Head__r.Name FROM Family__c];
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

  @AuraEnabled
  public static void createFamilyWithHead(
    String familyName,
    String headName,
    String headEmail,
    String headPhone,
    String headAddress
  ) {
    //create family
    Family__c fam = new Family__c(Name = familyName);
    System.debug('before family insert');
    insert fam;

    //create head member

    Member__c head = new Member__c(
      Name = headName,
      Email__c = headEmail,
      Phone__c = headPhone,
      Address__c = headAddress,
      Family__c = fam.Id,
      Role__c = 'Head'
    );
    System.debug('before head insert');
    insert head;
    //store head directly in family
    fam.Head__c = head.Id;
    update fam;
  }
}
