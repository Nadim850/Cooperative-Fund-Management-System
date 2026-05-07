public with sharing class transactionController {
  @AuraEnabled
  public static List<Transaction__c> getTransactions() {
    return [
      SELECT Name, Month__c, Type__c, Member__c, Amount__c, Payment_Date__c
      FROM Transaction__c
      ORDER BY CreatedDate ASC
      LIMIT 100
    ];
  }
}
