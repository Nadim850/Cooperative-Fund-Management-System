import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import LightningConfirm from "lightning/confirm";

import getMember from "@salesforce/apex/memberController.getMember";
import findMember from "@salesforce/apex/memberController.findMember";
import delMember from "@salesforce/apex/memberController.delMember";
import delMultiMember from "@salesforce/apex/memberController.delMultiMember";

import MEMBER_OBJECT from "@salesforce/schema/Member__c";
import MEMBER_NAME from "@salesforce/schema/Member__c.Name";
import MEMBER_ADDRESS from "@salesforce/schema/Member__c.Address__c";
import MEMBER_PHONE from "@salesforce/schema/Member__c.Phone__c";
import MEMBER_EMAIL from "@salesforce/schema/Member__c.Email__c";
import FAMILY_FIELD from "@salesforce/schema/Member__c.Family__c";

const COLUMNS = [
  { label: "Name", fieldName: "Name", type: "text" },
  {
    type: "action",
    typeAttributes: {
      rowActions: [
        { label: "View", name: "view_member" },
        { label: "Delete", name: "delete_member" },
        { label: "View Transactions", name: "view_transactions" },
        { label: "Add Transaction", name: "add_transaction" }
      ]
    }
  }
];

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
  Member__c_fields = [
    MEMBER_NAME,
    MEMBER_EMAIL,
    MEMBER_PHONE,
    MEMBER_ADDRESS,
    FAMILY_FIELD
  ];

  columns = COLUMNS;
  key = " ";
  selectedMemberId = [];
  findMember = [];
  allMembers = [];
  showMemberForm = false;
  showModal = false;
  showMemberDetail = false;
  modalTitle = "";
  isLoading = false;
  showFamilyTable = true;
  addTransactionForm = false;

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
    if (this.key && this.key.trim() !== "") {
      return this.findMember;
    }
    return this.allMembers;
  }

  handleSearch(event) {
    const value = event.target.value;
    console.log(value);
    if (!value || value.trim() === "") {
      this.showToast("input empty", "Please enter a value", "warning");
      this.key = undefined;
      return;
    }
    this.key = value;
  }
  handleMemberSuccess() {
    this.showModal = false;
    refreshApex(this.wiredMembersResult);
    this.showToast("Success", "Member Created Successfully", "success");
  }
  get showDeleteButton() {
    return !this.selectedMemberId || this.selectedMemberId.length === 0;
  }
  async handleDeleteSelected() {
    const count = this.selectedMemberId?.length || 0;
    if (!this.selectedMemberId || this.selectedMemberId.length === 0) {
      this.showToast("Error", "No Member selected", "error");
      return;
    }
    //confrimation before deleting
    const confirmed = await LightningConfirm.open({
      message: `Are you sure you want to delete ${count} account(s)`,
      variant: "header",
      label: "Confirm Deletion"
    });

    if (!confirmed) {
      return;
    }
    this.isLoading = true;

    try {
      const result = await delMultiMember({ memberIds: this.selectedMemberId });
      this.showToast("Success", result, "success");
      await refreshApex(this.wiredMembersResult);
      this.selectedMemberId = [];
    } catch (error) {
      const msg =
        error?.body?.message || error?.message || "Unknown error occured";
      this.showToast("Error", msg, "error");
    } finally {
      this.isLoading = false;
    }
  }
  handleError(event) {
    console.log("Error:", JSON.stringify(event.detail));
    //this.showToast("Error creating record", event.detail.message, "error");
  }
  openMemberModal() {
    this.showModal = true;
    this.modalTitle = "Create New Member";
    this.showMemberDetail = false;
    this.showMemberForm = true;
  }
  closeModal() {
    this.showMemberForm = false;
    this.showModal = false;
  }
  async handleDelete(row) {
    //confirmation before deleting
    await LightningConfirm.open({
      message: `Are you sure you want to delete ${row.Name} From Members`,
      variant: "header",
      label: "Confirm Deletion"
    })
      .then((result) => {
        //only if user click okay
        if (result) {
          delMember({ memberId: row.Id }).then(() => {
            this.allMembers = this.allMembers.filter(
              (acc) => acc.Id !== row.Id
            );
            this.showToast("Deleted", "Member Deleted successfully", "success");
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  handleView(row) {
    this.modalTitle = "View Member";
    this.selectedMemberId = row.Id;
    this.showModal = true;
    this.showMemberForm = false;
    this.showMemberDetail = true;
  }
  handleAddTransactions(row) {
    this.modalTitle = "Add Transaction";
    this.selectedMemberId = row.Id;
    this.showModal = true;
    this.addTransactionForm = true;
  }
  handleViewTransactions(row) {
    this.selectedMemberId = row.Id;
    this.showTransaction = true;
  }
  handleRowSelection(event) {
    console.log("Selected Rows: " + event.detail.selectedRows);
    this.selectedMemberId = event.detail.selectedRows.map((row) => row.Id);
    console.log("Selected IDs:", [...this.selectedMemberId]);
  }
  async handleMemberRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    switch (actionName) {
      case "view_member":
        this.handleView(row);
        break;
      case "delete_member":
        this.handleDelete(row);
        break;
      case "view_transactions":
        this.handleViewTransactions(row);
        break;
      case "add_transaction":
        this.handleAddTransactions(row);
        break;

      default:
    }
  }
}
