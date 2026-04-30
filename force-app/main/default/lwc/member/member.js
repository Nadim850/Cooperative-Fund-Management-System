import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";

import getMember from "@salesforce/apex/memberController.getMember";
import findMember from "@salesforce/apex/memberController.findMember";
import MEMBER_OBJECT from "@salesforce/schema/Member__c";
import MEMBER_NAME from "@salesforce/schema/Member__c.Name";
import MEMBER_ADDRESS from "@salesforce/schema/Member__c.Address__c";
import MEMBER_PHONE from "@salesforce/schema/Member__c.Phone__c";
import FAMILY_FIELD from "@salesforce/schema/Member__c.Family__c";

const COLUMNS = [{ label: "Name", fieldName: "Name", type: "text" }];

export default class Member extends LightningElement {
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
  Member__c = MEMBER_OBJECT;
  Member__c_fields = [MEMBER_NAME, MEMBER_ADDRESS, MEMBER_PHONE, FAMILY_FIELD];

  columns = COLUMNS;
  key = " ";
  selectedMemberId = [];
  findMember = [];
  allMembers = [];
  showMemberForm = false;
  showModal = false;

  @wire(getMember)
  wiredMembers(result) {
    this.wiredMembersResult = result;
    if (result.data) {
      this.allMembers = result.data;
      console.log(this.allMembers);
    }
  }
  @wire(findMember, { key: "$key" })
  wiredSearch({ data }) {
    if (data) {
      this.findMember = data;
    }
  }

  get displayMember() {
    if (this.key && this.key.trim() !== " ") {
      return this.findMember;
    }
    return this.allMembers;
  }

  handleSearch(event) {
    const value = event.target.value;
    console.log(value);
    if (!value || value.trim() === " ") {
      this.showToast("input empty", "Please enter a value", "warning");
      this.key = undefined;
      return;
    }
    this.key = value;
  }
  handleMemberSuccess(event) {
    this.showModal = false;
    refreshApex(this.wiredMembersResult);
    this.showToast(
      "Member Created",
      "Record Id: " + event.detail.id,
      "success"
    );
  }
  handleError(event) {
    console.log("Error:", JSON.stringify(event.detail));
    //this.showToast("Error creating record", event.detail.message, "error");
  }
  openMemberModal() {
    this.showModal = true;
    this.showMemberForm = true;
  }
}
