public with sharing class transactionController {
  @AuraEnabled(cacheable=true)
  public static List<Transaction__c> getTransactions(Id memberId) {
    return [
      SELECT Type__c, Member__c, Amount__c, Payment_Date__c
      FROM Transaction__c
      WHERE Member__c = :memberId
      ORDER BY Payment_Date__c DESC
    ];
  }

  @AuraEnabled
  public static void addTransaction(Transaction__c transactionRec) {
  }
  @AuraEnabled
  public static void deleteTransaction(Id transactionId) {
    delete [
      SELECT Id
      FROM transaction__c
      WHERE Id = :transactionId
    ];
  }
}
