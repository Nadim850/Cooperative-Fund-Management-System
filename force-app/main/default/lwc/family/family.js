import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import LightningConfirm from "lightning/confirm";

import FindFamily from "@salesforce/apex/familyController.FindFamily";
import getFamily from "@salesforce/apex/familyController.getFamily";

import FAMILY_OBJECT from "@salesforce/schema/Family__c";
import NAME_FIELD from "@salesforce/schema/Family__c.Name";
import HOF_FIELD from "@salesforce/schema/Family__c.Head_OF_Family__c";
import MEMBER_FIELD from "@salesforce/schema/Family__c.Member__r.Name";

import MEMBER_OBJECT from "@salesforce/schema/Member__c";
import MEMBER_NAME from "@salesforce/schema/Member__c.Name";
import MEMBER_ADDRESS from "@salesforce/schema/Member__c.Address__c";
import MEMBER_PHONE from "@salesforce/schema/Member__c.Phone__c";
import FAMILY_FIELD from "@salesforce/schema/Member__c.Family__c";

const COLUMNS = [
  { label: "Family Name", fieldName: "Name", type: "text" },
  // {
  //   label: "View Members",
  //   type: "button icon",
  //   initialWidth: 100,

  //   typeAttributes: {
  //     iconName: "utility:user",
  //     name: "view_members",
  //     size: "medium",
  //     alternativeText: "view members"
  //   }
  // },
  // {
  //   label: "More Options",
  //   type: "button-icon",

  //   initialWidth: 100,

  //   typeAttributes: {
  //     iconName: "utility:down",
  //     name: "more",
  //     //variant: "bare",
  //     size: "medium",
  //     alternativeText: "More option",
  //     class: "slds-m-left_xx-small"
  //   }
  // },
  // {
  //   label: "Delete Family",
  //   type: "button-icon",

  //   initialWidth: 100,

  //   typeAttributes: {
  //     iconName: "utility:delete",
  //     name: "delete_Family",
  //     //variant: "bare",
  //     size: "medium",
  //     alternativeText: "Delete Family",
  //     class: "slds-m-left_xx-small"
  //   }
  // },
  {
    label: "Add Member",
    type: "button-icon",

    initialWidth: 100,

    typeAttributes: {
      iconName: "utility:adduser",
      name: "add_member",
      //variant: "bare",
      size: "medium",
      alternativeText: "Add Member",
      class: "slds-m-left_xx-small"
    }
  }
];

export default class Family extends LightningElement {
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

  Family__c = FAMILY_OBJECT;
  Family__c_fields = [NAME_FIELD, HOF_FIELD, MEMBER_FIELD];
  Member__c = MEMBER_OBJECT;
  Member__c_fields = [MEMBER_NAME, MEMBER_ADDRESS, MEMBER_PHONE, FAMILY_FIELD];

  columns = COLUMNS;
  key = " ";
  modalTitle = "";
  selectedFamilyId = "";
  searchFamily = [];
  allFamilies = [];
  showFamilyCreationForm = false;
  showMemberCreationForm = false;
  showMemberTable = false;
  showModal = false;

  @wire(FindFamily, { key: "$key" })
  wiredSearch({ data }) {
    if (data) {
      this.searchFamily = data;
    }
  }

  @wire(getFamily)
  wiredFamilies(result) {
    this.wiredFamiliesResult = result;
    if (result.data) {
      this.allFamilies = result.data;
    }
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
  handleFamilySuccess(event) {
    this.showModal = false;
    refreshApex(this.wiredFamiliesResult);

    this.showToast(
      "Family created",
      "Record Id: ",
      +event.detail.id,
      "warning"
    );
  }
  handleMemberSuccess(event) {
    this.showModal = false;
    console.log("event object: " + event);
    // this.showToast(
    //   "Member created",
    //   "Record Id: ",
    //   +event.detail.id,
    //   "success"
    // );
  }

  get displayFamily() {
    if (this.key && this.key.trim() !== "") {
      return this.searchFamily;
    }
    return this.allFamilies;
  }

  openModal() {
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
  }
  openFamilyModal() {
    this.showModal = true;
    this.showFamilyCreationForm = true;
    this.showMemberCreationForm = false;
    this.showMemberTable = false;

    this.modalTitle = "Create Family";
  }
  openMemberModal() {
    this.showModal = true;
    this.showMemberCreationForm = true;
    this.showMemberTable = false;
    this.modalTitle = "Add Member";
  }
  handleError(event) {
    console.log("Error:", JSON.stringify(event.detail));

    //this.showToast("Error creating record", event.detail.message, "error");
  }
  handleFamilyRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    if (actionName === "add_member") {
      this.showFamilyCreationForm = false;
      this.selectedFamilyId = row.Id;
      this.openMemberModal();
    }
  }
}
