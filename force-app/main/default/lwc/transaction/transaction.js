import { LightningElement, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import LightningConfirm from "lightning/confirm";

import getTransactions from "@salesforce/apex/transactionController.getTransactions";
import TRANSACTION_OBJ from "@salesforce/schema/Transaction__c";
//import TRANSACTION_NAME from "@salesforce/schema/Transaction__c.Name";
import TRANSACTION_MONTH from "@salesforce/schema/Transaction__c.Month__c";
import TRANSACTION_TYPE from "@salesforce/schema/Transaction__c.Type__c";
import TRANSACTION_MEMBER from "@salesforce/schema/Transaction__c.Member__c";
import TRANSACTION_AMOUNT from "@salesforce/schema/Transaction__c.Amount__c";
import TRANSACTION_PAYMENT_DATE from "@salesforce/schema/Transaction__c.Payment_Date__c";

const COLUMNS = [
  { label: "Name", fieldName: "Name", type: "text" },
  { label: "Date", fieldName: "Payment_Date__c", type: "date" },
  { label: "Type", fieldName: "Type__c", type: "text" },
  { label: "Month", fieldName: "Month__c", type: "text" },
  { label: "Amount", fieldName: "Amount__c", type: "currency" }
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
  columns = COLUMNS;
  modalTitle = "";
  allTransactions = [];
  showModal = false;
  showTransactionForm = false;
  showTransactionDetail = false;

  @wire(getTransactions)
  wiredTransactions(result) {
    this.wiredTransactionsResult = result;
    if (result.data) {
      this.allTransactions = result.data;
    } else if (result.error) {
      console.error(result.error);
    }
  }

  closeModal() {
    this.showTransactionDetail = false;
    this.showTransactionForm = false;
    this.showModal = false;
  }
  openTransactionModal() {
    this.showModal = true;
    this.showTransactionForm = true;
    this.modalTitle = "Create new Transaction";
    this.showTransactionDetail = false;
  }
  handleTransactionSuccess() {
    this.showModal = false;
    //refresh method
    this.showToast(
      "Transaction Added",
      "Transaction Added Successfully",
      "success"
    );
  }

  displayTranasactions() {
    return this.allTransactions;
  }
}
