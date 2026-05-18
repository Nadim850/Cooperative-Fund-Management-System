import isLoanEligible from "@salesforce/apex/loanController.isLoanEligible";
import getMembers from "@salesforce/apex/memberController.getMember";
import createLoan from "@salesforce/apex/loanController.createLoan";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import { refreshApex } from "@salesforce/apex";
import { LightningElement, wire } from "lwc";

export default class loan extends LightningElement {
  //toast helper method
  showToast(title, message, variant) {
    this.dispatchEvent(
      new ShowToastEvent({
        title,
        message,
        variant
      })
    );
  }

  resetForm() {
    this.selectedMemberId = "";
    this.loanAmount = 0;
    this.durationMonths = 12;

    this.totalPayable = 0;
    this.emiAmount = 0;

    this.showSummary = false;
    this.isEligible = false;
  }
  selectedMemberId;
  isEligible = false;

  loanAmount = 0;
  durationMonths = 24;

  totalPayable = 0;
  emiAmount = 0;

  showSummary = false;

  memberOptions = [];
  wiredMemberResult;

  @wire(getMembers)
  wiredMembers(result) {
    this.wiredMemberResult = result;
    const { data, error } = result;
    if (data) {
      this.memberOptions = data.map((member) => {
        return {
          label: member.Name,
          value: member.Id
        };
      });
    } else if (error) {
      console.error(error);
    }
  }
  async handleMemberChange(event) {
    this.selectedMemberId = event.detail.value;

    try {
      const result = await isLoanEligible({
        memberId: this.selectedMemberId
      });
      this.isEligible = result;
    } catch (error) {
      console.log(error);
    }
  }

  handleLoanAmount(event) {
    this.loanAmount = Number(event.target.value);
  }

  handleDuration(event) {
    this.durationMonths = Number(event.target.value);
  }

  calculateLoan() {
    this.totalPayable = this.loanAmount;

    this.emiAmount = (this.totalPayable / this.durationMonths).toFixed(2);

    this.showSummary = true;
  }

  async saveLoan() {
    try {
      await createLoan({
        memberId: this.selectedMemberId,
        loanAmount: this.loanAmount,
        durationMonths: this.durationMonths,
        emiAmount: this.emiAmount,
        totalPayable: this.totalPayable
      });
      this.showToast("Success", "Loan Created Successfully", "success");
      this.resetForm();
      await refreshApex(this.wiredMemberResult);
    } catch (error) {
      console.error(error);
      console.log("Error:", JSON.stringify(error));

      this.showToast("Error", "Failed to create loan", "error");
    }
  }

  handleError(event) {
    console.log("Error:", JSON.stringify(event.detail));
    //this.showToast("Error creating record", event.detail.message, "error");
  }
}
