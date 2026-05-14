import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import LightningConfirm from "lightning/confirm";

import FindFamily from "@salesforce/apex/familyController.FindFamily";
import getFamily from "@salesforce/apex/familyController.getFamily";
import delFamily from "@salesforce/apex/familyController.delFamily";
import delMultiFamilies from "@salesforce/apex/familyController.delMultiFamilies";
import getMembersByFamilyId from "@salesforce/apex/familyController.getMembersByFamilyId";
import createFamilyWithHead from "@salesforce/apex/familyController.createFamilyWithHead";
import getTransactions from "@salesforce/apex/transactionController.getTransactions";
import updateLastContributionDate from "@salesforce/apex/transactionController.updateLastContributionDate";
import checkMonthlyContributions from "@salesforce/apex/memberController.checkMonthlyContributions";

import FAMILY_OBJECT from "@salesforce/schema/Family__c";
import NAME_FIELD from "@salesforce/schema/Family__c.Name";

import MEMBER_OBJECT from "@salesforce/schema/Member__c";
import MEMBER_NAME from "@salesforce/schema/Member__c.Name";
import MEMBER_ADDRESS from "@salesforce/schema/Member__c.Address__c";
import MEMBER_PHONE from "@salesforce/schema/Member__c.Phone__c";
import FAMILY_FIELD from "@salesforce/schema/Member__c.Family__c";

const COLUMNS = [
  { label: "Family Name", fieldName: "Name", type: "text" },
  { label: "Head", fieldName: "headName", type: "text" },
  {
    type: "action",
    typeAttributes: {
      rowActions: [
        { label: "View Members", name: "view_members" },
        { label: "Delete", name: "delete" },
        { label: "Add Member", name: "add_member" },
        { label: "Edit Family", name: "edit_family" }
      ]
    }
  }
];

const MEMBER_TABLE = [
  { label: "Name", fieldName: "Name", type: "text" },
  {
    label: "Total Contribution",
    fieldName: "totalContribution",
    type: "currency",
    typeAttributes: {
      currencyCode: "INR"
    }
  },
  {
    type: "action",
    typeAttributes: {
      rowActions: [
        { label: "View ", name: "view_member" },
        { label: "Delete", name: "delete_member" },
        { label: "Add Transaction", name: "add_transaction" },
        { label: "View Transaction", name: "view_transaction" }
      ]
    }
  }
];
const TRANSACTION_COLUMNS = [
  { label: "Amount", fieldName: "Amount__c", type: "currency" },
  { label: "Type", fieldName: "Type__c", type: "text" },
  { label: "Date", fieldName: "Payment_Date__c", type: "date" }
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
  TRANSACTION_COLUMNS = TRANSACTION_COLUMNS;
  Family__c = FAMILY_OBJECT;
  Family__c_fields = [NAME_FIELD];
  Member__c = MEMBER_OBJECT;
  Member__c_fields = [MEMBER_NAME, MEMBER_ADDRESS, MEMBER_PHONE, FAMILY_FIELD];
  member_columns = MEMBER_TABLE;
  columns = COLUMNS;
  key = " ";
  isLoading = false;
  modalTitle = "";
  selectedFamilyId = [];
  searchFamily = [];
  allFamilies = [];
  showFamilyCreationForm = false;
  showMemberCreationForm = false;
  showFamilyEditForm = false;
  showMemberEditFrom = false;
  showModal = false;
  isSaving = false;
  memberOptions = [];
  selectedHeadId;
  addTransactionForm = false;
  showTransactionTable = false;
  showMemberDetail = false;
  transactions = [];

  //Head logic
  familyName = "";
  headName = "";
  headEmail = "";
  headPhone = "";
  headAddress = "";

  handleFamilyName(e) {
    this.familyName = e.target.value;
  }
  handleHeadName(e) {
    this.headName = e.target.value;
  }
  handleHeadEmail(e) {
    this.headEmail = e.target.value;
  }
  handleHeadPhone(e) {
    this.headPhone = e.target.value;
  }
  handleHeadAddress(e) {
    this.headAddress = e.target.value;
  }

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
      console.log(JSON.stringify(result.data));
      this.allFamilies = result.data.map((item) => {
        return {
          Id: item.Id,
          Name: item.Name,
          headName: item.Head__r ? item.Head__r.Name : ""
        };
      });
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
  handleFamilySuccess() {
    this.showFamilyCreationForm = false;
    this.showModal = false;
    refreshApex(this.wiredFamiliesResult);
    this.showToast("Success", "Family created successfull", "success");
  }
  handleMemberSuccess() {
    this.showModal = false;
    this.showToast("Success", "Member Addedd Successfull ", "success");
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
    this.showFamilyTable = false;
  }
  handleError(event) {
    console.log("Error:", JSON.stringify(event.detail));

    //this.showToast("Error creating record", event.detail.message, "error");
  }
  handleAdd(row) {
    this.showFamilyCreationForm = false;
    this.selectedFamilyId = row.Id;
    this.openMemberModal();
    this.showDeleteButton = false;
    this.showTransactionTable = false;
    this.showMemberDetail = false;
  }

  async handleView(row) {
    console.log("handleView CALLED", row.Id);
    this.isLoading = true;
    this.filteredMembers = [];
    this.showMemberTable = false;
    this.showMemberCreationForm = false;
    this.showMemberDetail = false;
    this.showFamilyEditForm = false;

    this.addTransactionForm = false;
    this.showTransactionTable = false;
    this.showModal = false;

    try {
      const result = await getMembersByFamilyId({ familyId: row.Id });

      console.log("members returned: ", result);

      this.filteredMembers = result;

      if (result.length > 0) {
        this.modalTitle = "Members";
        this.showFamilyEditForm = false;
        this.showMemberTable = true;
        this.showModal = true;
      } else {
        this.showToast(
          "No Members Available",
          "No members related to this family found",
          "warning"
        );
      }
    } catch (error) {
      console.error(error);
      this.showToast("Error", "Failed to fetch members", "error");
    } finally {
      this.isLoading = false;
    }
  }
  async handleDelete(row) {
    //confirmation before deleting
    await LightningConfirm.open({
      message: `Are you sure you want to delete ${row.Name} From families`,
      variant: "header",
      label: "Confirm Deletion"
    })
      .then((result) => {
        //only if user click okay
        if (result) {
          delFamily({ familyId: row.Id }).then(() => {
            this.allFamilies = this.allFamilies.filter(
              (fam) => fam.Id !== row.Id
            );
            this.showToast(
              "Deleted",
              `Family Deleted successfully ${row.Name}`,
              "success"
            );
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  async handleEdit(row) {
    this.selectedFamilyId = row.Id;
    this.selectedHeadId = row.Head__c;
    this.addTransactionForm = false;

    const result = await getMembersByFamilyId({
      familyId: row.Id
    });

    this.memberOptions = result.map((member) => ({
      label: member.Name,
      value: member.Id
    }));
    this.showModal = true;
    this.showFamilyEditForm = true;
    this.modalTitle = "Edit Family";
  }
  handleFamilyUpdateSuccess() {
    this.showToast("Success", "Family updated successfully", "success");
    this.showFamilyEditForm = false;
    this.showModal = false;
    refreshApex(this.wiredFamiliesResult);
  }
  handleCloseFamilyEdit() {
    this.showModal = false;
    this.showFamilyEditForm = false;
  }

  handleHeadChange(event) {
    this.selectedHeadId = event.detail.value;
  }
  handleFamilySubmit(event) {
    event.preventDefault();

    const fields = event.detail.fields;

    fields.Head__c = this.selectedHeadId;

    this.template.querySelector("lightning-record-edit-form").submit(fields);
  }
  get showDeleteButton() {
    return !this.selectedFamilyId || this.selectedFamilyId.length === 0;
  }

  handleFamilyRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    switch (actionName) {
      case "view_members":
        this.handleView(row);
        break;
      case "delete":
        this.handleDelete(row);
        break;
      case "add_member":
        this.handleAdd(row);
        break;
      case "edit_family":
        this.handleEdit(row);
        break;
      default:
    }
  }
  async handleDeleteSelected() {
    const count = this.selectedFamilyId?.length || 0;
    if (!this.selectedFamilyId || this.selectedFamilyId.length === 0) {
      this.showToast("Error", "No Family selected", "error");
      this.showDeleteButton = false;
      return;
    }
    //confrimation before deleting
    const confirmed = await LightningConfirm.open({
      message: `Are you sure you want to delete ${count} Families`,
      variant: "header",
      label: "Confirm Deletion"
    });

    if (!confirmed) {
      return;
    }
    this.isLoading = true;

    try {
      const result = await delMultiFamilies({
        familyIds: this.selectedFamilyId
      });
      this.showToast("success", result, "success");
      await refreshApex(this.wiredFamiliesResult);
      this.selectedFamilyId = [];
    } catch (error) {
      const msg =
        error?.body?.message || error?.message || "Unknown error occured";
      this.showToast("Error", msg, "error");
    } finally {
      this.showDeleteButton = false;
      this.isLoading = false;
    }
  }
  handleRowSelection(event) {
    console.log("Selected Rows: " + event.detail.selectedRows);
    this.selectedFamilyId = event.detail.selectedRows.map((row) => row.Id);
    console.log("Selected IDs:", [...this.selectedFamilyId]);
  }
  async handleSave() {
    if (
      !this.familyName ||
      !this.headName ||
      !this.headEmail ||
      !this.headPhone ||
      !this.headAddress
    ) {
      this.showToast("Error", "Please fill required fields", "error");
      return;
    }

    try {
      await createFamilyWithHead({
        familyName: this.familyName,
        headName: this.headName,
        headEmail: this.headEmail,
        headPhone: this.headPhone,
        headAddress: this.headAddress
      });
      this.showToast("Success", "Famiy & Head created", "success");
      await refreshApex(this.wiredFamiliesResult);
      this.showFamilyCreationForm = false;
    } catch (error) {
      console.log(JSON.stringify(error));
      const message =
        error?.body?.pageErrors?.[0]?.message ||
        error?.body?.message ||
        "Unknown Error";
      this.showToast("Error", message, "error");
    }
  }

  async handleMemberRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    switch (actionName) {
      case "view_member":
        this.handleViewMember(row);
        break;
      case "delete_member":
        this.handleDelete(row);
        break;
      case "add_transaction":
        console.log(actionName);
        this.handleAddTransactions(row);
        break;
      case "view_transaction":
        this.handleShowTransactions(row);
        break;

      default:
    }
  }
  handleAddTransactions(row) {
    this.modalTitle = "Add Transaction";
    this.selectedMemberId = row.Id;
    this.showModal = true;
    this.addTransactionForm = true;
    this.showMemberTable = false;
    console.log("add transaction clicked");
  }

  async handleShowTransactions(row) {
    this.showMemberTable = false;
    try {
      this.selectedMemberId = row.Id;

      this.transactions = await getTransactions({
        memberId: row.Id
      });

      this.showTransactionTable = true;
      this.modalTitle = "Transaction";
      this.selectedMemberId = row.Id;
      this.showModal = true;
      this.addTransactionForm = false;
      this.showTransactionTable = true;

      console.log(this.transactions);
    } catch (error) {
      console.error(error);
    }
  }
  handleViewMember(row) {
    console.log(row);

    this.modalTitle = row.Name;
    this.showModal = true;
    this.showMemberDetail = true;
    this.showTransactionTable = false;
    this.showMemberTable = false;
    this.showFamilyTable = false;
    this.showFamilyEditForm = false;
  }

  async handleTransactionSuccess() {
    await updateLastContributionDate({
      memberId: this.selectedMemberId
    });
    console.log("Transaction Created");
    this.showModal = false;
    this.addTransactionForm = false;
    this.showToast("Success", "Transaction Added Successfully", "success");
  }

  async handleTransactionSubmit(event) {
    event.preventDefault();
    const fields = event.detail.fields;

    //check only contribution

    if (fields.Type__c === "Contribution") {
      try {
        const alreadyContributed = await checkMonthlyContributions({
          memberId: this.selectedMemberId
        });
        if (alreadyContributed) {
          this.showToast(
            "Error",
            "Member already contributed this month",
            "error"
          );
          return;
        }
      } catch (error) {
        console.error(error);
        console.log("Error:", JSON.stringify(event.detail));
        return;
      }
    }
    this.template.querySelector("lightning-record-edit-form").submit(fields);
  }
}
