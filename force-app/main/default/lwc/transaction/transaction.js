import { LightningElement, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import getTransactions from "@salesforce/apex/transactionController.getTransactions";
import TRANSACTION_OBJ from "@salesforce/schema/Transaction__c";
import TRANSACTION_TYPE from "@salesforce/schema/Transaction__c.Type__c";
import TRANSACTION_MEMBER from "@salesforce/schema/Transaction__c.Member__c";
import TRANSACTION_AMOUNT from "@salesforce/schema/Transaction__c.Amount__c";
import TRANSACTION_PAYMENT_DATE from "@salesforce/schema/Transaction__c.Payment_Date__c";

const COLUMNS = [
  { label: "Amount", fieldName: "Amount__c", type: "currency" },
  { label: "Type", fieldName: "Type__c", type: "text" },
  { label: "Status", fieldName: "Status__c", type: "text" },
  { label: "Date", fieldName: "Payment_Date__c", type: "date" }
];
export default class Transaction extends LightningElement {
  showToast(title, message, variant) {
    this.dispatchEvent(
      new ShowToastEvent({
        title,
        message,
        variant
      })
    );
  }
  Transaction__c = TRANSACTION_OBJ;
  Transaction__c_fields = [
    TRANSACTION_MEMBER,
    TRANSACTION_AMOUNT,
    TRANSACTION_TYPE,
    TRANSACTION_PAYMENT_DATE,
    TRANSACTION_MONTH
  ];
  @api memberId;
  columns = COLUMNS;
  allTransactions = [];
  showTransactionForm = false;
  showTransactions = false;
  transactions = [];
  selectedMemberId;

  @wire(getTransactions, { memberId: "$memberfId" })
  wiredTransactions({ data, error }) {
    if (data) {
      this.transactions = data;
    }
    if (error) {
      console.error(error);
    }
  }
  handleViewTransactions(event) {
    const memberId = event.detail.row.Id;
    this.selectedMemberId = memberId;
    this.showTransactions = true;

    getTransactions({ memberId: memberId }).then((result) => {
      this.transactions = result;
    });
  }
}
