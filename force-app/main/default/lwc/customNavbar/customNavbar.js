import { LightningElement } from "lwc";
import { NavigationMixin } from "lightning/navigation";

export default class CustomNavbar extends NavigationMixin(LightningElement) {
  navigateTo(tabName) {
    this[NavigationMixin.Navigate]({
      type: "standard__navItemPage",
      attributes: {
        apiName: tabName
      }
    });
  }

  goHome() {
    this.navigateTo("Home");
  }

  goFamilies() {
    this.navigateTo("Families");
  }

  goMembers() {
    this.navigateTo("Members");
  }

  goTransactions() {
    this.navigateTo("Transactions");
  }

  goLoans() {
    this.navigateTo("Loans");
  }
}
