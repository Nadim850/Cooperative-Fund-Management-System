public with sharing class loanController {
  @AuraEnabled(cacheable=true)
  public static Boolean isLoanEligible(Id memberId) {
    AggregateResult result = [
      SELECT SUM(Amount__c) total
      FROM Transaction__c
      WHERE Member__c = :memberId AND Type__c = 'Contribution'
    ];

    Decimal totalContribution = (Decimal) result.get('total');

    if (totalContribution == null) {
      totalContribution = 0;
    }

    return totalContribution >= 6000;
  }
  @AuraEnabled
  public static Id createLoan(
    Id memberId,
    Decimal loanAmount,
    Integer duratinMonths,
    Decimal emiAmount,
    Decimal totalPayable
  ) {
    Loan__c loan = new Loan__c();

    loan.Member__c = memberId;
    Loan.Amount__c = loanAmount;
    loan.Duration_Months__c = duratinMonths;
    loan.EMI_Amount__c = emiAmount;
    loan.Total_Payable__c = totalPayable;
    loan.Start_Date__c = Date.today();
    loan.Loan_Status__c = 'Active';

    insert loan;
    return loan.Id;
  }
}
