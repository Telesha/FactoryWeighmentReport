import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from 'src/layouts/DashboardLayout';
import MainLayout from 'src/layouts/MainLayout';
import AccountView from 'src/views/account/AccountView';
import CustomerListView from 'src/views/customer/CustomerListView';
import DashboardView from 'src/views/reports/DashboardView';
import LoginView from 'src/views/auth/LoginView';
import NotFoundView from 'src/views/errors/NotFoundView';
import RegisterView from 'src/views/auth/RegisterView';
import SettingsView from 'src/views/settings/SettingsView';
import UserListing from 'src/views/user/Pages/Listing';
import UserAddEdit from 'src/views/user/Pages/AddEdit';
import LegalEntityAddEdit from 'src/views/LegalEntity/Pages/AddEdit';
import LegalEntityListing from 'src/views/LegalEntity/Pages/Listing';
import GroupListing from 'src/views/Groups/Pages/Listing';
import GroupAddEdit from 'src/views/Groups/Pages/AddEdit';
import FactoryListing from 'src/views/Factory/Pages/Listing';
import FactoryAddEdit from 'src/views/Factory/Pages/AddEdit';
import CollectionTypeAddEdit from 'src/views/CollectionType/Pages/AddEdit';
import CollectionTypeListing from 'src/views/CollectionType/Pages/Listing';
import GeneralDetails from 'src/views/Factory/Pages/TabPages/GeneralDetails';
import { ContactInformation } from 'src/views/Factory/Pages/TabPages/ContactInformation';
import FactoryAccounts from 'src/views/Factory/Pages/TabPages/FactoryAccounts';
import Productdetails from 'src/views/Factory/Pages/TabPages/ProductDetails';
import CustomerAddEdit from 'src/views/CustomerMaintenance/Pages/AddEdit';
import CustomerListing from 'src/views/CustomerMaintenance/Pages/Listing';
import ProductAddEdit from 'src/views/product/Pages/AddEdit';
import ProductListing from 'src/views/product/Pages/Listing';
import RouteAddEdit from 'src/views/Route/Pages/AddEdit';
import RouteListing from 'src/views/Route/Pages/Listing';
import FactoryGRNListing from 'src/views/FactoryItemGRN/Pages/Listing';
import FactoryGRNAddEdit from 'src/views/FactoryItemGRN/Pages/AddEdit';
import FactoryItemAddEdit from 'src/views/FactoryItem/Pages/AddEdit';
import FactoryItemListing from 'src/views/FactoryItem/Pages/Listing';
import FactoryItemAdjustmentListing from 'src/views/FactoryItemAdjustment/Pages/Listing';
import FactoryItemAdjustmentAddEdit from 'src/views/FactoryItemAdjustment/Pages/AddEdit';
import PermissionListing from 'src/views/Rolepermissions/Pages/Listing';
import FactoryItemRequestListing from 'src/views/FactoryItemRequest/Pages/Listing';
import FactoryItemRequestView from 'src/views/FactoryItemRequest/Pages/View';
//import AdvancePaymentRequestAddEdit from 'src/views/OverAdvancePaymentRequest/AddEdit';
import AdvancePaymentRequestListing from 'src/views/OverAdvancePaymentRequest/Pages/Listing';
import AdvancePaymentRequestView from 'src/views/OverAdvancePaymentRequest/Pages/View';
import RoleAddEdit from 'src/views/Role/Pages/AddEdit';
import RoleListing from 'src/views/Role/Pages/Listing';
import FactoryItemApprovalListing from 'src/views/FactoryItemApproval/Pages/Listing';
import AdvancePaymentApprovalAddEdit from 'src/views/AdvancePaymentRequestApproval/Pages/AddEdit';
import AdvancePaymentApprovalListing from 'src/views/AdvancePaymentRequestApproval/Pages/Listing';
import Unauthorized from './utils/unauthorized';
import CollectionTypeAdvanceRate from 'src/views/CollectionTypeAdvanceRate/Pages/AddEdit';
import BalancePaymentListing from 'src/views/BalancePayment/Pages/Listing';
import CustomerBalancePaymentAddEdit from 'src/views/CustomerBalancePayment/Pages/AddEdit';
import CustomerBalancePaymentViewBalance from 'src/views/CustomerBalancePayment/Pages/ViewBalance';
import CustomerBalancePaymentListing from 'src/views/CustomerBalancePayment/Pages/Listing';
import AdvancePaymentListing from 'src/views/AdvancePayment/Pages/Listing';
import CollectionTypeBalanceAddEdit from 'src/views/CollectionTypeBalanceRate/Pages/AddEdit';
import ManualLeafUploadAddListing from 'src/views/ManualLeafUpload/Pages/AddEdit';
import PasswordChange from 'src/views/user/Pages/PasswordChange';
import FactoryItemMobileRequestIssue from 'src/views/FactoryItemApproval/Pages/FactoryItemMobileRequestIssue';
import FactoryItemDirectIssue from 'src/views/FactoryItemApproval/Pages/FactoryItemDirectIssue';
import AdvancePaymentApproveRejectListing from 'src/views/AdvancePaymentApproveReject/Pages/Listing';
import CropBulkUploadAddEdit from 'src/views/CropBulkUpload/Pages/AddEdit';
import LeafAmendmentListing from 'src/views/LeafAmendment/Pages/ListingEdit';
import FactoryItemSupplierAddEdit from 'src/views/Supplier/Pages/AddEdit';
import FactoryItemSupplierListing from 'src/views/Supplier/Pages/Listing';
import FundMasterAddEdit from 'src/views/FundMasterScreen/Pages/AddEdit';
import FundMaintenanceListing from 'src/views/FundMasterScreen/Pages/listing';
import CustomerHistory from 'src/views/CustomerHistory/Pages/Listing';
import OverAdvanceCreate from 'src/views/OverAdvancePaymentRequest/Pages/AddEdit';
import CustomerProfileMain from 'src/views/CustomerProfile/Pages/ProfileMain';
import LoanRequest from 'src/views/Loan/Pages/AddEdit';
import LoanRequestListing from 'src/views/Loan/Pages/Listing';
import ManualTransactionUpload from './views/ManualTransactionUpload/Pages/AddEdit';
import LoanRequestApprovalReject from './views/Loan/Pages/ApprovalReject';
import ChartOfAccountListing from './views/ChartOfAccount/Pages/Listing';
import ChartOfAccountTreeViewListing from './views/ChartOfAccount/Pages/ChartOfAccountTreeView';
import CustomerBalanceReconciliation from './views/CustomerBalanceReconciliation/Pages/AddEdit';
import GeneralJournalAddEdit from './views/GeneralJournal/Pages/AddEdit';
import GeneralJournalListing from './views/GeneralJournal/Pages/Listing';
import GLMappingListing from './views/GLMapping/Pages/GLMapping';
import GLMappingAddEdit from './views/GLMapping/Pages/AddEdit';
import GeneralJournalApprove from './views/GeneralJournal/Pages/Approve';
import GeneralJournalView from './views/GeneralJournal/Pages/View';
import GLMappingApproveReject from './views/GLMapping/Pages/ApproveReject';
import BalancePaymentSummaryReport from './views/ReportingModules/BalancePaymentSummaryReport/Pages/Report';
import ChangeUserPassword from './views/user/Pages/ChangePasswordByUser';
import LedgerAccountApprovalListing from './views/LedgerAccountApproval/Pages/Listing';
import LedgerAccountApprovalEdit from './views/LedgerAccountApproval/Pages/AccountApproval';
import PurchaseOrderAddEdit from './views/PurchaseOrder/Pages/AddEdit';
import PurchaseOrderListing from './views/PurchaseOrder/Pages/Listing';
import CashCustomerReport from './views/ReportingModules/CashCustomerReport/Pages/Report';
import DailyNonPluckingAttendanceReport from './views/ReportingModules/DailyNonPluckingAttendanceReport/Pages/Report';
import BankCustomerDetailsReport from './views/ReportingModules/BankCustomerDetailsReport/Pages/Report';
import BankSummaryReport from './views/ReportingModules/BankSummaryReport/Pages/Report';
import InquiryRegistry from './views/ReportingModules/InquiryRegistry/Pages/Report';
import ChequeCustomerReport from './views/ReportingModules/ChequeCustomerReport/Pages/Report';
import CustomerChequePrint from './views/CustomerChequePrint/Pages/CustomerChequePrint';
import BalancePaymentBankIssuance from './views/BalancePaymentBankIssuance/Pages/Listing';
import AdvancePaymentDetails from './views/AdvancePaymentDetails/Pages/Listing';
import ViewAdvancePaymentStatusHistory from './views/AdvancePaymentDetails/Pages/ViewStatusHistory';
import CutomerBulkUpload from './views/CutomerBulkUpload/Pages/AddEdit';
import BulkReceiptPrint from './views/BulkReceiptPrint/Pages/Listing';
import RouteSummaryReport from './views/ReportingModules/RouteSummaryReport/Pages/Report';
import DailyCropReport from './views/ReportingModules/DailyCropReport/Pages/Report';
import ClientRegistrationReport from './views/ReportingModules/ClientRegistrationReport/Pages/Report';
import RouteCropPercentageReport from './views/ReportingModules/RouteCropPrecentageReport/Pages/Report';
import SlipFileDownload from './views/SlipFileDownload/Pages/Listing';
import RouteCropComparisonReport from './views/ReportingModules/RouteCropComparisonReport/Pages/Report';
import CropSlabReport from './views/ReportingModules/CropSlabReport/Pages/Report';
import CustomerCropSlabReport from './views/ReportingModules/CustomerCropSlabReport/Pages/CropSlabReport';
import SupplierCropComparisonMonthlyReport from './views/ReportingModules/SupplierCropComparisonMonthlyReport/Pages/Report';
import FactoryCropComparisonMonthlyReport from './views/ReportingModules/FactoryCropComparisonMonthlyReport/Pages/Report';
import LoanHistoryReport from './views/ReportingModules/LoanHistoryReport/Pages/Report';
import FactoryItemDetailReport from './views/ReportingModules/FactoryItemDetailReport/Pages/Report';
import CurrentBLLoansReport from './views/ReportingModules/CurrentBLLoansReport/Pages/Report';
import FactoryItemDetailInstalmentReport from './views/ReportingModules/FactoryItemDetailInstallment/Pages/Report';
import LoanIssuedDetailsReport from './views/ReportingModules/LoanIssuedDetailsReport/Pages/Report';
import LoanIssuedWithInASpecificPeriodReport from './views/ReportingModules/LoanIssuedWithInASpecificPeriodReport/Pages/Report';
import TrialBalanceReport from './views/ReportingModules/TrialBalanceReport/Pages/Report';
import FactoryItemSummaryReport from './views/ReportingModules/FactoryItemSummaryReport/Pages/Report';
import SlowMovingDebtListReport from './views/ReportingModules/SlowMovingDebtListReport/Pages/Report';
import SupplyDebtListReport from './views/ReportingModules/SupplyDebtListReport/Pages/Report';
import CropForecastDailyReport from './views/ReportingModules/CropForecastDailyReport/Pages/Report';
import CropForecastMonthlyReport from './views/ReportingModules/CropForecastMonthlyReport/Pages/Report';
import LoanWiseCropReport from './views/ReportingModules/LoanWiseCropReport/Pages/Report';
import BalanceSheetReport from './views/ReportingModules/BalanceSheet/Pages/Report';
import BalanceSheetReportConfigurationSetup from './views/ReportingModules/BalanceSheet/Pages/BalanceSheetConfigurations';
import AllDebtList from './views/ReportingModules/AllDebtList/Pages/Report';
import CropSupplyPatternReport from './views/ReportingModules/CropSupplyPatternReport/Pages/Report';
import NotSupplyDebtListReport from './views/ReportingModules/NotSupplyDebtListReport/Pages/Report';
import BrokerAddEdit from './views/Broker/Pages/AddEdit';
import BrokerListing from './views/Broker/Pages/Listing';
import FactoryEnteringAddEdit from './views/FactoryEntering/Pages/AddEdit';
import FactoryEnteringListing from './views/FactoryEntering/Pages/Listing';
import FactoryEnteringView from './views/FactoryEntering/Pages/View';
import GreenLeafRouteDetails from './views/ReportingModules/GreenLeafRouteDetails/Pages/Report';
import GreenLeafSupplierDetailsReport from './views/ReportingModules/GreenLeafSupplierReport/Pages/Report';
import GradeAddEdit from 'src/views/Grade/Pages/AddEdit';
import GradeListing from 'src/views/Grade/Pages/Listing';
import SellerContactListing from './views/SellerContact/Pages/Listing';
import SellerContactAddEdit from './views/SellerContact/Pages/AddEdit';
import BuyerAddEdit from './views/BuyerRegistration/Pages/AddEdit';
import BuyerListing from './views/BuyerRegistration/Pages/Listing';
import MonthEndStockListing from './views/MonthEndStock/Pages/Listing';
import MonthEndStockAddEdit from './views/MonthEndStock/Pages/AddEdit';
import GreenLeafEntryListing from './views/ReportingModules/GreenLeafEntry/Pages/Listing';
import GreenLeafEntryAddEdit from './views/ReportingModules/GreenLeafEntry/Pages/AddEdit';
import GreenLeafEntryView from './views/ReportingModules/GreenLeafEntry/Pages/View';
import PhysicalBalanceListing from './views/ReportingModules/PhysicalBalance/Pages/Listing';
import PhysicalBalanceAddEdit from './views/ReportingModules/PhysicalBalance/Pages/AddEdit';
import PhysicalBalanceView from './views/ReportingModules/PhysicalBalance/Pages/View';
import ManufacturingListing from 'src/views/Manufacturing/Pages/Listing';
import ManufacturingAddEditMain from 'src/views/Manufacturing/Pages/TabViews/MainView';
import AcknowledgementListing from './views/Acknowledgement/Pages/Listing';
import AcknowledgementAddEdit from './views/Acknowledgement/Pages/AddEdit';
import EstateListing from './views/Estate/Pages/Listing';
import EstateAddEdit from './views/Estate/Pages/AddEdit';
import DispatchInvoiceListing from './views/DispatchInvoice/Pages/Listing';
import DispatchInvoiceAdd from './views/DispatchInvoice/Pages/Add';
import DispatchInvoiceEdit from './views/DispatchInvoice/Pages/Edit';
import ValuationAddEdit from './views/Valuation/Pages/AddEdit';
import ValuationListing from './views/Valuation/Pages/Listing';
import Catalogue from './views/ReportingModules/Catalogue/Pages/Report';
import DirectSale from './views/DirectSale/Pages/Listing';
import DivisionAddEdit from './views/Division/Pages/AddEdit';
import DivisionListing from './views/Division/Pages/Listing';

import DirectSaleAddEdit from './views/DirectSale/Pages/AddEdit';
import DailyCheckRollAdd from './views/DailyCheckRollAdd/Pages/AddEdit';
import DailyCheckRollReport from './views/ReportingModules/EstateDailyCheckRollViewReport/Pages/Report';
import EmployeeWages from './views/ReportingModules/EmployeeWages/Pages/Report';
import SundryAttendancesAdding from './views/SundryAttendancesAdding/Pages/AddEdit';
import SundryAttendancesView from './views/ReportingModules/SundryAttendancesView/Pages/Report';
import JobWiseAreaCoveredAdding from './views/ReportingModules/JobWiseAreaCoveredAdding/Pages/Report';
import JobWiseAreaCoveredView from './views/ViewJobWiseAreaCovered/Pages/Listing';
import FinancialYearSetup from './views/FinancialYearSetup/Pages/AddEdit';
import ProfitAndLossReport from './views/ReportingModules/ProfitAndLossReport/Pages/Report';
import ProfitAndLossReportConfigurationSetup from './views/ReportingModules/ProfitAndLossReport/Pages/TabPages/ProfitAndLossConfigurations';
import EmployeeAttendancesListing from './views/EmployeeAttendances/Pages/Listing';
import EmployeeAttendancesAddEdit from './views/EmployeeAttendances/Pages/AddEdit';
import EmployeeAttendanceBulkUpload from './views/EmployeeAttendanceBulkUpload/Pages/AddEdit';
import DebitNoteListing from './views/DebitNote/Pages/Listing';
import DebitNoteAddEdit from './views/DebitNote/Pages/AddEdit';
import PAndLComparisonReport from './views/ReportingModules/PAndLComparison/Pages/Report';
import PAndLComparisonConfigurations from './views/ReportingModules/PAndLComparison/Pages/PAndLComparisonConfigurtions';
import AuditReport from './views/ReportingModules/AuditReport/Pages/Report';
import JournalOberservationReport from './views/ReportingModules/JournalOberservationReport/Pages/Report';
import AuditTrialReport from './views/ReportingModules/AuditTrialReport/Pages/Report';
import ProfitAndLossReportConfigurationSetupMainPage from './views/ReportingModules/ProfitAndLossReport/Pages/ProfitAndLossConfigurationMainPage';
import COPReport from './views/COP/Pages/Report';
import CashFlowReport from './views/CashFlow/Pages/Report';
import FixedAssetAddEdit from './views/FixedAsset/Pages/AddEdit';
import FixedAssetListing from './views/FixedAsset/Pages/Listing';
import TEST from './views/ReportingModules/BalanceSheetComparison/Pages/Report';
import ConfigurationSetup from './views/ReportingModules/BalanceSheetComparison/Pages/Configurations';
import ChequeRegisterReport from './views/ReportingModules/ChequeRegister/Pages/Report';
import CreditNoteAddEdit from './views/CreditNote/Pages/AddEdit';
import CreditNoteListing from './views/CreditNote/Pages/Listing';
import ManufacturingDetailsReport from './views/ReportingModules/ManufacturingDetailsReport/Pages/Report';
import COPReportConfiguration from './views/COP/Pages/ConfigurationMainPage';
import CustomerWiseLoanReport from './views/ReportingModules/CustomerWiseLoanReport/Pages/Report';
import BankReconcilationViewUpdate from './views/BankReconciliation/Pages/ViewUpdate';
import SupplierWiseGrnItemDetail from './views/ReportingModules/SupplierWiseGrnItemDetail/Pages/Report';
import SalaryAdditionsDeductionsListing from './views/SalaryAdditionsDeductions/Pages/Listing';
import SalaryAdditionsDeductionsAddEdit from './views/SalaryAdditionsDeductions/Pages/AddEdit';
import StockBalanceReport from './views/ReportingModules/StockBalanceReport/Pages/Report';
import AccountFreezeListing from './views/AccountFreeze/Pages/Listing';
import AccountFreezeAddEdit from './views/AccountFreeze/Pages/AddEdit';
import CashFlowConfigurationMainPage from './views/CashFlow/Pages/ConfigurationMainPage';
import EmployeeAddEdit from './views/EmployeeRegistration/Pages/AddEdit';
import EmployeeListing from './views/EmployeeRegistration/Pages/Listing';
import LoanReshedulement from './views/Loan/Pages/LoanReschedulement';
import LoanEarlySettlement from './views/Loan/Pages/LoanEarlySettlement';
import BuyerwiseSalesReport from './views/ReportingModules/BuyerwiseSalesReport/Pages/Report';
import HREmployeesList from './views/HRSalaryCalculation/Pages/Listing';
import HRViewEmployeeSalary from './views/HRSalaryCalculation/Pages/ViewEmployeeSalary';
import DebtorsAgeing from './views/ReportingModules/DebtorsAgeing/Pages/Report';
import DebtorsAgeingConfigurationSetup from './views/ReportingModules/DebtorsAgeing/Pages/DebtorsAgeingConfiguration';
import CreditorsAgeing from './views/ReportingModules/CreditorsAgeing/Pages/Report';
import CreditorsAgeingConfigurationSetup from './views/ReportingModules/CreditorsAgeing/Pages/CreditorsAgeingConfiguration';
import ValuationReport from './views/ReportingModules/ValuationReport/Pages/Report';
import InventoryView from './views/FactoryItemStockView/Pages/Listing';
import BuyerwiseGradeSalesReport from './views/ReportingModules/BuyerwiseGradeSalesReport/Pages/Report';
import GradeWiseAverageReport from './views/ReportingModules/GradeWiseAverageReport/Pages/Report';
import SellingMarkWiseGradeReport from './views/ReportingModules/SellingMarkWiseGradeReport/Pages/Report';
import SellingMarkWiseSalesReport from './views/ReportingModules/SellingMarkWiseSalesReport/Pages/Report';
import CustomerWelfare from './views/CustomerWelfare/Pages/Listing';
import CustomerSavings from './views/CustomerSavings/Pages/Listing';
import StockViewReport from './views/ReportingModules/StockViewReport/Pages/Report';
import OpeningBalance from './views/OpeningBalance/Pages/Listing';
import PaymentView from './views/Payment/Pages/View';
import PaymentListing from './views/Payment/Pages/Listing';
import PaymentApprove from './views/Payment/Pages/Approve';
import PaymentAddEdit from './views/Payment/Pages/AddEdit';
import ReceivingView from './views/Receiving/Pages/View';
import ReceivingListing from './views/Receiving/Pages/Listing';
import ReceivingApprove from './views/Receiving/Pages/Approve';
import ReceivingAddEdit from './views/Receiving/Pages/AddEdit';
import MarkStaffAttendance from './views/StaffAttendance/Pages/AddEdit';
import StaffEmployeeAttendancesListing from './views/StaffAttendance/Pages/Listing';
import RequisitionListing from './views/Requisition/Pages/Listing';
import RequisitionAddEdit from './views/Requisition/Pages/AddEdit';
import QuotationInquiry from './views/Requisition/Pages/QuotationInquiry';
import StaffWages from './views/ReportingModules/StaffWages/Pages/Report';
import StaffWagesView from './views/ReportingModules/StaffWages/Pages/View';
import StaffAttendanceView from './views/ReportingModules/StaffAttendanceView/Pages/Report';
//import EmployeeLeaveForm from './views/EmployeeLeaveForm/Pages/Listing';
import EmployeeLeaveFormAddEdit from './views/EmployeeLeaveForm/Pages/AddEdit';
import EmployeeLeaveFormListing from './views/EmployeeLeaveForm/Pages/Listing';
import FieldRegistrationAddEdit from './views/FieldRegistration/Pages/AddEdit';
import FieldRegistrationListing from './views/FieldRegistration/Pages/Listing';
import GangRegistrationListing from './views/Gang/Pages/Listing';
import GangRegistrationAddEdit from './views/Gang/Pages/AddEdit';
import EmployeeBulkUploadAddEdit from './views/EmployeeBulkUpload/Pages/AddEdit';
import TaskAddEdit from './views/Task/Pages/AddEdit';
import TaskListing from './views/Task/Pages/Listing';
import TaskTemplateAddEdit from './views/TaskTemplate/Pages/AddEdit';
import TaskTemplateListing from './views/TaskTemplate/Pages/Listing';
import EmployeeCardPrintFiltering from './views/EmployeeCardPrint/Pages/Filtering';
import EmployeeCardCreationAddEdit from './views/EmployeeCardCreation/Pages/AddEdit';
import EmployeeCardCreationListing from './views/EmployeeCardCreation/Pages/Listing';
import EmployeeCardAssignListing from './views/EmployeeCardAssign/Pages/Listing';
import EmployeeCardAssignAddEdit from './views/EmployeeCardAssign/Pages/AddEdit';
import EmployeeCardActiveListing from './views/EmployeeCardActive/Pages/Listing';
import EmployeeCardSuspendListing from './views/EmployeeCardSuspend/Pages/Listing';
import EmployeeCardRegenerate from './views/CardRegenerate/Pages/Filtering';
import TaskCategoryListing from './views/TaskCategory/Pages/Listing';
import TaskCategoryAddEdit from './views/TaskCategory/Pages/AddEdit';
import VehicleRegistrationListing from './views/VehicleRegistration/Pages/Listing';
import VehicleRegistrationAddEdit from './views/VehicleRegistration/Pages/AddEdit';
import DeductionListing from './views/DeductionTemplate/Pages/Listing';
import DeductionAddEdit from './views/DeductionTemplate/Pages/AddEdit';
import RoleMobileMenuListing from './views/RoleMobileMenu/Pages/Listing';
import RoleMobileMenuAddEdit from './views/RoleMobileMenu/Pages/AddEdit';

import DivisionProductMappingListing from './views/DivisionProductMapping/Pages/Listing';
import DivisionProductMappingAddEdit from './views/DivisionProductMapping/Pages/AddEdit';

import EmployeeBiometricDetailsReport from './views/ReportingModules/EmployeeBiometricDetailsReport/Pages/Report';
import DailyAttendanceSessionWiseReport from './views/ReportingModules/DailyAttendanceSessionWiseReport/Pages/Report';
import PackageListing from './views/Package/Pages/Listing';
import AddEditPackage from './views/Package/Pages/AddEdit';
import EmployeeDetailsReport from './views/ReportingModules/EmployeeDetailsReport/Pages/Report';
import IgnoreSession from './views/IgnoreSession/Pages/Listing';
import IgnoreSessionAddEdit from './views/IgnoreSession/Pages/AddEdit';
import OffDayCashPaymentReport from './views/ReportingModules/OffDayCashPaymentReport/Pages/Report';
import CostCenterConfigurationListing from './views/CostCenterConfiguration/Pages/Listing';
import CostCenterConfigurationAddEdit from './views/CostCenterConfiguration/Pages/AddEdit';
import GardenLeaveTypeConfigurationAdd from './views/GardenLeaveTypeConfiguration/Pages/AddEdit';
import GardenLeaveTypeConfigurationListing from './views/GardenLeaveTypeConfiguration/Pages/Listing';
import DailyPaymentCalculation from './views/DailyPaymentCalculation/Pages/Listing';
import DailyAttendaceReport from './views/ReportingModules/DailyPluckingAttendanceReport/Pages/Report';
import GeneralJobPaymentDetailsReport from './views/ReportingModules/GeneralJobPaymentDetailsReport/Pages/Report';
import DailyCashJobPaymentDetailsReport from './views/ReportingModules/DailyCashJobPaymentDetailsReport/Pages/Report';
import LabourCheckListReport from './views/ReportingModules/LabourCheckListReport/Pages/Report';
import DailyFieldPerformanceReport from './views/ReportingModules/DailyFieldPerformanceReport/Pages/Report';
import SectionWiseDailyPluckingReport from './views/ReportingModules/SectionWiseDailyPluckingReport/Pages/Report';
import DailyLabourReport from './views/ReportingModules/DailyLabourReport/Pages/Report';
import DailyHarvesterPerformancesReport from './views/ReportingModules/DailyHarvesterPerformancesReport/Pages/Report';
import DailyNonPluckingJobPaymentDetailsReport from './views/ReportingModules/DailyNonPluckingPaymentDetailsReport/Pages/Report';
import GreenLeafIntakeReport from './views/ReportingModules/GreenLeafIntake/Pages/Report';
import WeeklyPaymentReport from './views/ReportingModules/WeeklyPaymentReport/Pages/Report';
import WeeklyPaymentSheet from './views/ReportingModules/WeeklyPaymentSheet/Pages/Report';
import WorkerAttendanceReport from './views/ReportingModules/WorkerAttendanceReport/Pages/Report';
import WorkerAttendanceNonPlukingReport from './views/ReportingModules/WorkerAttendanceNonPlukingReport/Pages/Report';
import PluckingReport from './views/ReportingModules/PluckingReport/Pages/Report';
import DailyOutsiderJobPaymentReport from './views/ReportingModules/DailyOutsiderJobPaymentReport/Pages/Report';
import LeaveAddEdit from './views/Leave/Pages/AddEdit';
import LeaveListing from './views/Leave/Pages/Listing';
import WeeklyOutsiderPaymentReport from './views/ReportingModules/WeeklyOutsiderPaymentReport/Pages/Report';
import WeeklyCashPaymentReport from './views/ReportingModules/WeeklyCashPaymentReport/Pages/Report';
import WeeklyNonPluckingPaymentReport from './views/ReportingModules/WeeklyNonPluckingPaymentReport/Pages/Report';
import WeeklyOutsiderNonPluckingPaymentReport from './views/ReportingModules/WeeklyOutsiderNonPluckingPaymentReport/Pages/Report';
import OffDayCashPaymentReportNonplucking from './views/ReportingModules/OffDayCashPaymentReportNonPlucking/Pages/Report';
import LeafChitReport from './views/ReportingModules/LeafChitReport/Pages/Report';
import DailyAttendaceSummaryReport from './views/ReportingModules/DailyAttendenceSummaryReport/Pages/Report';
import DailyNonPluckingActivityReport from './views/ReportingModules/DailyNonPluckingActivityReport/Pages/Report';
import WeeklyMorningCashPaymentReport from './views/ReportingModules/WeeklyMorningCashPaymentReport/Pages/Report';
import { LottieLoadingComponent } from './utils/lottieLoader';
import LeaveBalanceReport from './views/ReportingModules/LeaveBalanceReport/Pages/Report';
import LeaveHistoryReport from './views/ReportingModules/LeaveHistoryReport/Pages/Report';
import OtherDeductionAddEdit from './views/OtherDeduction/Pages/AddEdit';
import OtherDeductionListing from './views/OtherDeduction/Pages/Listing';
import OtherDeductionBulkUploadAddEdit from './views/OtherDeductionBulkUpload/Pages/AddEdit';
import NonPluckingAmendment from './views/NonPluckingAmendment/Pages/ListingOne';
import AdditionDeduction from './views/AdditionDeduction/Pages/Listing';
import DailyReconciliationExecution from './views/DailyReconciliationExecution/Pages/Listing';
import ReconciliationReport from './views/ReportingModules/ReconciliationReport/Pages/Report';
import WeeklyRationDeductionReport from './views/ReportingModules/WeeklyRationDeductionReport/Pages/Report';
import EODDetailsReport from './views/ReportingModules/EODDetailsReport/Pages/Report';
import DailyAttendanceReportMoreThanOneTask from './views/ReportingModules/DailyAttendanceReportMoreThanOneTask/Pages/Report';
import WeeklySalaryCompleteReport from './views/ReportingModules/WeeklySalaryCompleteReport/Pages/Report';
import TaskDetailReport from './views/ReportingModules/TaskDetailReport/Pages/Report';
import WeeklyOutsiderSalaryCompleteReport from './views/ReportingModules/WeeklyOutsiderSalaryCompleteReport/Pages/Report';
import WeeklyMorningCashSalaryCompleteReport from './views/ReportingModules/WeeklyMorningCashSalaryCompleteReport/Pages/Report';
import KatchaReport from './views/ReportingModules/KatchaReport/Pages/Report';
import DailyWagesMorningReport from './views/ReportingModules/DailyWagesMorningReport/Pages/Report';
import DailyWagesReport from './views/ReportingModules/DailyWagesReport/Pages/Report';
import DailyOutsiderWagesReport from './views/ReportingModules/DailyOutsiderWagesReport/Pages/Report';
import AddEditLandDistribution from './views/LandDistribution/Pages/AddEdit';
import ViewLandDistribution from './views/LandDistribution/Pages/Listing';
import EmployeeLeaveBulkListing from './views/EmployeeLeaveBulk/Pages/Listing';
import EmployeeLeaveBulkAddEdit from './views/EmployeeLeaveBulk/Pages/AddEdit';
import GrantAreasAndLabourOnBookReport from './views/ReportingModules/GrantAreasAndLabourOnBookReport/Pages/Report';
import FieldDetailsReport from './views/ReportingModules/FieldDetailsReport/Pages/Report';
import SupplementaryDetailsReport from './views/ReportingModules/SupplementaryDetailsReport/Pages/Report';
import RationDeduction from './views/ReportingModules/RationDeduction/Pages/Report';
import RationEntitlementReport from './views/ReportingModules/RationEntitlementReport/Pages/Report';
import LandDistributionDetailsReport from './views/ReportingModules/LandDistributionDetailsReport/Pages/Report';
import LeaveEligibilityBulkUploadListing from './views/LeaveEligibilityBulkUpload/Pages/Listing';
import LeaveEligibilityBulkUploadAddEdit from './views/LeaveEligibilityBulkUpload/Pages/AddEdit';
import EmployeeRegistrationCardReport from './views/ReportingModules/EmployeeRegistrationCardReport/Pages/Report';
import FieldHistoryDetailsReport from './views/ReportingModules/FieldHistoryReport/Pages/Report';
import NonPluckingAttendanceReport from './views/ReportingModules/NonPluckingAttendanceReport/Pages/Report';
import TaskReport from './views/ReportingModules/TaskReport/Pages/Report';
import TaskSummaryReport from './views/ReportingModules/TaskSummaryReport/Pages/Report.js'
import BiometricSummaryReport from './views/ReportingModules/BiometricSummaryReport/Pages/Report';
import MusterChitReport from './views/ReportingModules/MusterChitReport/Pages/Report';
import DailyWeighmentRegistery from './views/ReportingModules/DailyWeighmentRegistery/Pages/Report';
import WorkLocationPayPointUpdate from './views/WorkLocationPayPointUpdate/Pages/AddEdit';
import EmployeeAvailedReport from './views/ReportingModules/EmployeeAvailedReport/Pages/Report';
import EmployeeTransferReport from './views/ReportingModules/EmployeeTransferReport/Pages/Report';
import WeeklyRationExecution from "./views/WeeklyRationExecution/Pages/Listing";
import PruningDetailsReport from './views/ReportingModules/PruningDetailsReport/Pages/Report';
import HolidayCalendarScreen from './views/HolidayCalendarScreen/Pages/AddEdit';
import LeaveTypeAddEdit from './views/LeaveType/Pages/AddEdit';
import LeaveTypeListing from './views/LeaveType/Pages/Listing';
import DailyPluckingReconciliationReport from './views/ReportingModules/DailyPluckingReconciliationReport/Pages/Report';
import DailyNonPluckingReconciliationReport from './views/ReportingModules/DailyNonPluckingReconciliationReport/Pages/Report';
import DailyKatchaReport from './views/ReportingModules/DailyKatchaReport/Pages/Report';
import VehicleTypeListing from './views/VehicleType/Pages/Listing';
import VehicleTypeAddEdit from './views/VehicleType/Pages/AddEdit';
import ElectricityDeductionAddEdit from './views/ElectricityDeduction/Pages/AddEdit';
import ElectricityDeductionListing from './views/ElectricityDeduction/Pages/Listing';
import PaypointExceptionReport from './views/ReportingModules/PaypointExceptionReport/Pages/Report';
import EmployeeLeaveAddEdit from './views/EmployeeLeave/Pages/AddEdit'
import ShortLeaveApprovalAddEdit from './views/ShortLeaveApprovals/Pages/AddEdit';
import ShortLeaveApprovalListing from './views/ShortLeaveApprovals/Pages/Listing';
import RationConfigurationAddEdit from './views/RationConfiguration/Pages/AddEdit';
import RationConfigurationListing from './views/RationConfiguration/Pages/Listing';
import AbsentListReport from './views/ReportingModules/AbsentListReport/Pages/Report';
import HolidaysReport from './views/ReportingModules/HolidaysReport/Pages/Report';
import PFDeductionReport from './views/ReportingModules/PFDeductionReport/Pages/Report'

import EmployeeProfile from './views/ReportingModules/EmployeeProfile/Pages/Report';
import TransferAttendanceListing from './views/TransferAttendance/Pages/Listing';
import PluckingAmendmentAdd from './views/PluckingAmendment/Pages/AddEdit'
import PluckingAmendmentListing from './views/PluckingAmendment/Pages/Listing'

import EmployeeLeaveCancellation from './views/EmployeeLeaveCancellation/Pages/Listing';
import DailyLeaveBalanceReport from './views/ReportingModules/DailyLeaveBalanceReport/Pages/Report';
import FactoryWeighmentAdd from './views/FactoryWeighment/Pages/AddEdit'
import PluckingAttendanceReport from './views/ReportingModules/PluckingAttendanceReport/Pages/Report';
import FactoryWeighmentReport from './views/ReportingModules/FactoryweighmentReport/pages/Report';

const routes = isLoggedIn => [
  {
    path: 'app',
    element: isLoggedIn ? <DashboardLayout /> : <Navigate to="/signin" />,
    children: [
      { path: 'account', element: <AccountView /> },
      { path: 'customers', element: <CustomerListView /> },
      { path: 'dashboard', element: <DashboardView /> },
      { path: 'settings', element: <SettingsView /> },
      { path: '*', element: <Navigate to="/404" /> },
      {
        path: 'users',
        children: [
          { path: 'listing', element: <UserListing /> },
          { path: 'addEdit/:userID', element: <UserAddEdit /> },
          { path: 'passwordChange/:userID', element: <PasswordChange /> },
          {
            path: 'changeUserPassword/:userID',
            element: <ChangeUserPassword />
          }
        ]
      },

      {
        path: 'groups',
        children: [
          { path: 'listing', element: <GroupListing /> },
          { path: 'addEdit/:masterGroupID', element: <GroupAddEdit /> }
        ]
      },
      {
        path: 'legalEntity',
        children: [
          { path: 'listing', element: <LegalEntityListing /> },
          { path: 'addEdit/:groupID', element: <LegalEntityAddEdit /> }
        ]
      },
      {
        path: 'products',
        children: [
          { path: 'listing', element: <ProductListing /> },
          { path: 'addEdit/:productID', element: <ProductAddEdit /> }
        ]
      },
      {
        path: 'routes',
        children: [
          { path: 'listing', element: <RouteListing /> },
          { path: 'addEdit/:routeID', element: <RouteAddEdit /> }
        ]
      },
      {
        path: 'customers',
        children: [
          { path: 'listing', element: <CustomerListing /> },
          { path: 'addEdit/:customerID', element: <CustomerAddEdit /> }
        ]
      },
      {
        path: 'collectionTypes',
        children: [
          { path: 'listing', element: <CollectionTypeListing /> },
          {
            path: 'addEdit/:collectionTypeID',
            element: <CollectionTypeAddEdit />
          }
        ]
      },
      {
        path: 'factories',
        children: [
          { path: 'listing', element: <FactoryListing /> },
          { path: 'addEdit/:factoryID', element: <FactoryAddEdit /> },
          { path: 'factoryAccounts/:groupID', element: <ContactInformation /> }
        ]
      },
      {
        path: 'factoryGRN',
        children: [
          { path: 'listing', element: <FactoryGRNListing /> },
          { path: 'addEdit/:factoryItemGRNID', element: <FactoryGRNAddEdit /> }
        ]
      },
      {
        path: 'factoryItemAdjustment',
        children: [
          { path: 'listing', element: <FactoryItemAdjustmentListing /> },
          {
            path: 'addEdit/:factoryItemAdjustmentID',
            element: <FactoryItemAdjustmentAddEdit />
          }
        ]
      },
      {
        path: 'factoryItems',
        children: [
          { path: 'listing', element: <FactoryItemListing /> },
          { path: 'addEdit/:factoryItemID', element: <FactoryItemAddEdit /> }
        ]
      },
      {
        path: 'jobWiseAreaCovered',
        children: [
          {
            path: 'addEdit/:jobWiseAreaCoveredID',
            element: <JobWiseAreaCoveredAdding />
          }
        ]
      },

      {
        path: 'roles',
        children: [
          { path: 'listing', element: <RoleListing /> },
          { path: 'addEdit/:roleID', element: <RoleAddEdit /> }
        ]
      },
      {
        path: 'factoryItemRequestDetails',
        children: [
          { path: 'listing', element: <FactoryItemRequestListing /> },
          {
            path: 'viewfactoryItemRequestDetails/:factoryItemRequestID',
            element: <FactoryItemRequestView />
          }
        ]
      },
      {
        path: 'rolePermission',
        children: [
          {
            path: 'listing/:roleID/:roleLevelID',
            element: <PermissionListing />
          }
        ]
      },
      {
        path: 'factoryItemApproval',
        children: [
          { path: 'listing', element: <FactoryItemApprovalListing /> },
          {
            path: 'addEdits/:factoryItemRequestID',
            element: <FactoryItemMobileRequestIssue />
          },
          {
            path: 'itemIssue/:factoryItemRequestID',
            element: <FactoryItemDirectIssue />
          }
        ]
      },
      {
        path: 'advancePaymentRequest',
        children: [
          { path: 'listing', element: <AdvancePaymentRequestListing /> },
          {
            path: 'addEdit/:advancePaymentRequestID',
            element: <OverAdvanceCreate />
          },
          {
            path: 'view/:advancePaymentRequestID',
            element: <AdvancePaymentRequestView />
          }
        ]
      },
      {
        path: 'advancePaymentApproval',
        children: [
          { path: 'listing', element: <AdvancePaymentApprovalListing /> },
          {
            path: 'addEdit/:advancePaymentRequestID',
            element: <AdvancePaymentApprovalAddEdit />
          }
        ]
      },
      {
        path: 'advancePayment',
        children: [{ path: 'listing', element: <AdvancePaymentListing /> }]
      },
      { path: 'unauthorized', element: <Unauthorized /> },
      {
        path: 'balancepayment',
        children: [{ path: 'listing', element: <BalancePaymentListing /> }]
      },
      {
        path: 'customerBalancePayment',
        children: [
          { path: 'listing', element: <CustomerBalancePaymentListing /> },
          {
            path: 'addEdit/:customerBalancePaymentID',
            element: <CustomerBalancePaymentAddEdit />
          },
          {
            path: 'viewPayment/:customerBalancePaymentID',
            element: <CustomerBalancePaymentViewBalance />
          }
        ]
      },
      {
        path: 'AdvanceRate',
        element: <CollectionTypeAdvanceRate />
      },
      {
        path: 'BalanceRate',
        element: <CollectionTypeBalanceAddEdit />
      },
      {
        path: 'manualLeafUpload',
        element: <ManualLeafUploadAddListing />
      },
      {
        path: 'employeeBulkUpload',
        element: <EmployeeBulkUploadAddEdit />
      },
      {
        path: 'advancePaymentApproveReject',
        children: [
          {
            path: 'listing/:advancePaymentRequestID',
            element: <AdvancePaymentApproveRejectListing />
          }
        ]
      },
      {
        path: 'loan',
        children: [
          { path: 'loanRequest', element: <LoanRequest key={1} /> },
          {
            path: 'loanRequestApproval/:customerLoanID',
            element: <LoanRequestApprovalReject key={1} />
          },
          { path: 'listing', element: <LoanRequestListing /> },
          {
            path: 'loanReshedulement/:customerLoanID',
            element: <LoanReshedulement key={1} />
          },
          {
            path: 'loanEarlySettlement/:customerLoanID',
            element: <LoanEarlySettlement key={1} />
          }
        ]
      },
      {
        path: 'cropDetailsBulkUplaod',
        element: <CropBulkUploadAddEdit />
      },
      {
        path: 'factoryItemSuppliers',
        children: [
          { path: 'listing', element: <FactoryItemSupplierListing /> },
          {
            path: 'addEdit/:supplierID',
            element: <FactoryItemSupplierAddEdit />
          }
        ]
      },
      {
        path: 'leafAmendment',
        element: <LeafAmendmentListing />
      },
      {
        path: 'fundMaintenance',
        children: [
          { path: 'listing', element: <FundMaintenanceListing /> },
          { path: 'addEdit/:fundMasterID', element: <FundMasterAddEdit /> }
        ]
      },
      {
        path: 'customerHistory',
        element: <CustomerHistory />
      },
      {
        path: 'customerProfile',
        element: <CustomerProfileMain />
      },
      {
        path: 'manualTrasactionUpload',
        children: [{ path: 'addEdit', element: <ManualTransactionUpload /> }]
      },
      {
        path: 'chartOfAccount',
        children: [
          { path: 'listing', element: <ChartOfAccountListing /> },
          {
            path: 'viewTreeView/:groupID/:factoryID',
            element: <ChartOfAccountTreeViewListing />
          }
        ]
      },
      {
        path: 'customerBalanceReconciliation',
        element: <CustomerBalanceReconciliation />
      },
      {
        path: 'generalJournal',
        children: [
          { path: 'listing', element: <GeneralJournalListing /> },
          {
            path: 'addEdit/:referenceNumber/:groupID/:factoryID',
            element: <GeneralJournalAddEdit />
          },
          {
            path:
              'view/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation/:referenceNumber',
            element: <GeneralJournalView />
          },
          {
            path: 'approve/:referenceNumber/:groupID/:factoryID',
            element: <GeneralJournalApprove />
          }
        ]
      },
      {
        path: 'glmapping',
        children: [
          { path: 'listing', element: <GLMappingListing /> },
          {
            path: 'addEdit/:transactionTypeID/:groupID/:factoryID',
            element: <GLMappingAddEdit />
          },
          {
            path: 'approveReject/:transactionTypeID/:groupID/:factoryID',
            element: <GLMappingApproveReject />
          }
        ]
      },
      {
        path: 'balancePaymentSummaryReport',
        element: <BalancePaymentSummaryReport />
      },
      {
        path: 'ledgerAcoountApproval',
        children: [
          { path: 'listing', element: <LedgerAccountApprovalListing /> },
          {
            path: 'addEdit/:ledgerAccountID',
            element: <LedgerAccountApprovalEdit />
          }
        ]
      },
      {
        path: 'purchaseOrder',
        children: [
          { path: 'listing', element: <PurchaseOrderListing /> },
          {
            path: 'addEdit/:purchaseOrderID',
            element: <PurchaseOrderAddEdit />
          }
        ]
      },
      {
        path: 'cashCustomerReport',
        element: <CashCustomerReport />
      },
      {
        path: 'bankCustomerDetailsReport',
        element: <BankCustomerDetailsReport />
      },
      {
        path: 'bankSummaryReport',
        element: <BankSummaryReport />
      },

      {
        path: 'chequeCustomerReport',
        element: <ChequeCustomerReport />
      },
      {
        path:
          'inquiryRegistry/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation',
        element: <InquiryRegistry key={1} />
      },
      {
        path:
          'inquiryRegistryFromTrialBalance/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation',
        element: <InquiryRegistry key={2} />
      },
      {
        path: 'customerCheque',
        children: [{ path: 'listing', element: <CustomerChequePrint /> }]
      },
      {
        path: 'balancePaymentBankIssuance',
        element: <BalancePaymentBankIssuance />
      },
      {
        path: 'advancePaymentDetails',
        children: [
          { path: 'listing', element: <AdvancePaymentDetails /> },
          {
            path: 'ViewStatusHistory/:advancePaymentRequestID',
            element: <ViewAdvancePaymentStatusHistory />
          }
        ]
      },

      {
        path: 'bulkReceiptPrint',
        element: <BulkReceiptPrint />
      },
      {
        path: 'customerBulkUpload',
        element: <CutomerBulkUpload />
      },
      {
        path: 'routeSummaryReport',
        element: <RouteSummaryReport />
      },
      {
        path: 'dailyCropReport',
        element: <DailyCropReport />
      },
      {
        path: 'clientRegistrationDetailReport',
        element: <ClientRegistrationReport />
      },
      {
        path: 'routeCropPercentageReport',
        element: <RouteCropPercentageReport />
      },
      {
        path: 'slipFileDownload',
        element: <SlipFileDownload />
      },
      {
        path: 'routeCropComparisonReport',
        element: <RouteCropComparisonReport />
      },
      {
        path: 'cropSlabReport',
        element: <CropSlabReport />
      },
      {
        path: 'customerCropSlabReport',
        element: <CustomerCropSlabReport />
      },
      {
        path: 'supplierCropComparisonMonthlyReport',
        element: <SupplierCropComparisonMonthlyReport />
      },
      {
        path: 'factoryCropComparisonMonthlyReport',
        element: <FactoryCropComparisonMonthlyReport />
      },
      {
        path: 'loanHistoryReport',
        element: <LoanHistoryReport />
      },
      {
        path: 'factoryItemDetailReport',
        element: <FactoryItemDetailReport />
      },
      {
        path: 'currentBLLoansReport',
        element: <CurrentBLLoansReport />
      },
      {
        path: 'factoryItemDetailInstallmentReport',
        element: <FactoryItemDetailInstalmentReport />
      },
      {
        path: 'loanIssuedDetailsReport',
        element: <LoanIssuedDetailsReport />
      },
      {
        path: 'loanIssuedWithInASpecificPeriodReport',
        element: <LoanIssuedWithInASpecificPeriodReport />
      },
      {
        path:
          'trailBalanceReport/:groupID/:factoryID/:startDate/:endDate/:IsGuestNavigation',
        element: <TrialBalanceReport key={1} />
      },
      {
        path:
          'trailBalanceReportReturn/:groupID/:factoryID/:startDate/:endDate/:IsGuestNavigation',
        element: <TrialBalanceReport key={2} />
      },
      {
        path: 'factoryItemSummaryReport',
        element: <FactoryItemSummaryReport />
      },
      {
        path: 'slowMovingDebtListReport',
        element: <SlowMovingDebtListReport />
      },
      {
        path: 'supplyDebtListReport',
        element: <SupplyDebtListReport />
      },
      {
        path: 'cropForecastDailyReport',
        element: <CropForecastDailyReport />
      },
      {
        path: 'cropForecastMonthlyReport',
        element: <CropForecastMonthlyReport />
      },
      {
        path: 'loanWiseCropReport',
        element: <LoanWiseCropReport />
      },
      {
        path: 'balanceSheet',
        children: [
          { path: 'balanceSheetReport', element: <BalanceSheetReport /> },
          {
            path: 'balanceSheetSetupConfiguration/:groupID/:factoryID',
            element: <BalanceSheetReportConfigurationSetup />
          }
        ]
      },
      {
        path: 'allDebtList',
        element: <AllDebtList />
      },
      {
        path: 'cropSupplyPatternReport',
        element: <CropSupplyPatternReport />
      },
      {
        path: 'notSupplyDebtListReport',
        element: <NotSupplyDebtListReport />
      },
      {
        path: 'grade',
        children: [
          { path: 'listing', element: <GradeListing /> },
          { path: 'addEdit/:gradeID', element: <GradeAddEdit /> }
        ]
      },
      {
        path: 'sellerContact',
        children: [
          { path: 'listing', element: <SellerContactListing /> },
          {
            path: 'addEdit/:sellerContractID',
            element: <SellerContactAddEdit />
          }
        ]
      },
      {
        path: 'buyerRegistration',
        children: [
          { path: 'listing', element: <BuyerListing /> },
          { path: 'addEdit/:buyerID', element: <BuyerAddEdit /> }
        ]
      },
      {
        path: 'monthEndStock',
        children: [
          { path: 'listing', element: <MonthEndStockListing /> },
          { path: 'addEdit/:roleID', element: <MonthEndStockAddEdit /> }
        ]
      },
      {
        path: 'greenLeafEntry',
        children: [
          { path: 'listing', element: <GreenLeafEntryListing /> },
          {
            path: 'addEdit/:greenLeafEntryID',
            element: <GreenLeafEntryAddEdit />
          },
          { path: 'view/:greenLeafEntryID', element: <GreenLeafEntryView /> }
        ]
      },
      {
        path: 'physicalbalance',
        children: [
          { path: 'listing', element: <PhysicalBalanceListing /> },
          {
            path: 'addEdit/:physicalbalanceID',
            element: <PhysicalBalanceAddEdit />
          },
          { path: 'view/:physicalbalanceID', element: <PhysicalBalanceView /> }
        ]
      },
      {
        path: 'catalogue',
        element: <Catalogue />
      },
      {
        path: 'directSale',
        children: [
          { path: 'listing', element: <DirectSale /> },
          {
            path: 'addEdit/:directSaleID',
            element: <DirectSaleAddEdit />
          }
        ]
      },
      {
        path: 'manufacturing',
        children: [
          { path: 'listing', element: <ManufacturingListing /> },
          {
            path: 'addEdit/:blManufaturingID',
            element: <ManufacturingAddEditMain />
          }
        ]
      },
      {
        path: 'acknowledgement',
        children: [
          { path: 'listing', element: <AcknowledgementListing /> },
          {
            path: 'addEdit/:teaProductDispatchID',
            element: <AcknowledgementAddEdit />
          }
        ]
      },
      {
        path: 'estate',
        children: [
          { path: 'listing', element: <EstateListing /> },
          { path: 'addEdit/:factoryID', element: <EstateAddEdit /> },
          { path: 'factoryAccounts/:groupID', element: <ContactInformation /> }
        ]
      },
      {
        path: 'division',
        children: [
          { path: 'listing', element: <DivisionListing /> },
          { path: 'addEdit/:routeID', element: <DivisionAddEdit /> }
        ]
      },
      {
        path: 'dispatchInvoice',
        children: [
          { path: 'listing', element: <DispatchInvoiceListing /> },
          {
            path: 'add/:teaProductDispatchID',
            element: <DispatchInvoiceAdd />
          },
          {
            path: 'edit/:teaProductDispatchID',
            element: <DispatchInvoiceEdit />
          }
        ]
      },
      {
        path: 'valuation',
        children: [
          { path: 'listing', element: <ValuationListing /> },
          { path: 'addEdit/:valuationID', element: <ValuationAddEdit /> }
        ]
      },
      {
        path: 'brokerRegistration',
        children: [
          { path: 'listing', element: <BrokerListing /> },
          { path: 'addEdit/:brokerID', element: <BrokerAddEdit /> }
        ]
      },
      {
        path: 'factoryEntering',
        children: [
          { path: 'listing', element: <FactoryEnteringListing /> },
          {
            path: 'addEdit/:greenLeafReceivingID',
            element: <FactoryEnteringAddEdit />
          },
          {
            path: 'view/:greenLeafReceivingID',
            element: <FactoryEnteringView />
          }
        ]
      },
      {
        path: 'dailyCheckRollAdd',
        element: <DailyCheckRollAdd />
      },
      {
        path: 'greenLeafRouteDetails',
        element: <GreenLeafRouteDetails />
      },
      {
        path: 'greenLeafSupplierDetailsReport',
        element: <GreenLeafSupplierDetailsReport />
      },
      {
        path: 'dailyCheckRollAdd',
        element: <DailyCheckRollAdd />
      },
      {
        path: 'dailyCheckRollView',
        element: <DailyCheckRollReport />
      },
      {
        path: 'employeeWages',
        element: <EmployeeWages />
      },
      {
        path: 'sundryAttendancesAdding',
        element: <SundryAttendancesAdding />
      },
      {
        path: 'sundryAttendancesView',
        element: <SundryAttendancesView />
      },
      {
        path: 'journalObservationReport',
        element: <JournalOberservationReport />
      },
      {
        path: 'profitAndLoss',
        children: [
          { path: 'profitAndLossReport', element: <ProfitAndLossReport /> },
          // { path: 'profitAndLossSetupConfiguration/:groupID/:factoryID', element: <ProfitAndLossReportConfigurationSetup /> },
          {
            path: 'profitAndLossSetupConfiguration/:groupID/:factoryID',
            element: <ProfitAndLossReportConfigurationSetupMainPage />
          }
        ]
      },
      {
        path: 'greenLeafRouteDetails',
        element: <GreenLeafRouteDetails />
      },
      {
        path: 'employeeAttendances',
        children: [
          {
            path: 'listing',
            element: <EmployeeAttendancesListing />
          },
          {
            path: 'addEdit/:employeeAttendancesID',
            element: <EmployeeAttendancesAddEdit />
          }
        ]
      },
      {
        path: 'employeeAttendancesBulkUpload',
        element: <EmployeeAttendanceBulkUpload />
      },
      {
        path: 'auditTrialReport',
        element: <AuditTrialReport />
      },
      {
        path: 'financialYearSetup',
        element: <FinancialYearSetup />
      },
      {
        path: 'COPReport',
        children: [
          { path: 'COPReport', element: <COPReport /> },
          {
            path: 'configuration/:groupID/:factoryID',
            element: <COPReportConfiguration />
          }
        ]
      },
      {
        path: 'CashFlow',
        children: [
          { path: 'CashFlowReport', element: <CashFlowReport /> },
          {
            path: 'configuration/:groupID/:factoryID',
            element: <CashFlowConfigurationMainPage />
          }
        ]
      },
      {
        path: 'PAndLComparison',
        children: [
          { path: 'PAndLComparisonReport', element: <PAndLComparisonReport /> },
          {
            path: 'PAndLComparisonConfigurations/:groupID/:factoryID',
            element: <PAndLComparisonConfigurations />
          }
        ]
      },
      {
        path: 'fixedAsset',
        children: [
          { path: 'listing', element: <FixedAssetListing /> },
          { path: 'addEdit/:groupID', element: <FixedAssetAddEdit /> }
        ]
      },
      {
        path: 'auditReport',
        element: <AuditReport />
      },
      {
        path: 'balanceSheetComparison',
        children: [
          { path: 'Report', element: <TEST /> },
          {
            path: 'ConfigurationSetup/:groupID/:factoryID',
            element: <ConfigurationSetup />
          }
        ]
      },
      {
        path: 'chequeRegisterReport',
        element: <ChequeRegisterReport />
      },
      {
        path: 'creditNote',
        children: [
          { path: 'listing', element: <CreditNoteListing /> },
          {
            path: 'addEdit/:groupID/:factoryID/:voucherNumber',
            element: <CreditNoteAddEdit />
          }
        ]
      },
      {
        path: 'DebitNote',
        children: [
          { path: 'listing', element: <DebitNoteListing /> },
          {
            path: 'addEdit/:groupID/:factoryID/:voucherNumber',
            element: <DebitNoteAddEdit />
          }
        ]
      },
      {
        path: 'CustomerWiseLoanReport',
        element: <CustomerWiseLoanReport />
      },
      {
        path: 'bankReconciliation',
        element: <BankReconcilationViewUpdate />
      },
      {
        path: 'supplierWiseGrnItemDetail',
        element: <SupplierWiseGrnItemDetail />
      },
      {
        path: 'salaryAdditionDeduction',
        children: [
          { path: 'listing', element: <SalaryAdditionsDeductionsListing /> },
          {
            path: 'addEdit/:salaryAdjustmentID',
            element: <SalaryAdditionsDeductionsAddEdit />
          }
        ]
      },
      {
        path: 'stockBalanceReport',
        element: <StockBalanceReport />
      },

      {
        path: 'FinancialMonthFreeze',
        children: [
          { path: 'listing', element: <AccountFreezeListing /> },
          {
            path: 'addEdit/:ledgerAccountFreezID',
            element: <AccountFreezeAddEdit />
          }
        ]
      },
      {
        path: 'EmployeeRegistration',
        children: [
          { path: 'listing', element: <EmployeeListing /> },
          { path: 'addEdit/:employeeID', element: <EmployeeAddEdit /> }
        ]
      },
      {
        path: 'FieldRegistration',
        children: [
          { path: 'listing', element: <FieldRegistrationListing /> },
          { path: 'addEdit/:fieldID', element: <FieldRegistrationAddEdit /> }
        ]
      },
      {
        path: 'manufacturingDetailsReport',
        element: <ManufacturingDetailsReport />
      },

      {
        path: 'HRSalaryCalculation',
        children: [
          { path: 'listing', element: <HREmployeesList /> },
          { path: 'viewSalary/:employeeID', element: <HRViewEmployeeSalary /> }
        ]
      },
      {
        path: 'BuyerwiseSalesReport',
        element: <BuyerwiseSalesReport />
      },
      {
        path: 'DebtorsAgeing',
        children: [
          { path: 'DebtorsAgeingReport', element: <DebtorsAgeing /> },
          {
            path: 'DebtorsAgeingSetupConfiguration/:groupID/:factoryID',
            element: <DebtorsAgeingConfigurationSetup />
          }
        ]
      },
      {
        path: 'CreditorAgeing',
        children: [
          { path: 'CreditorAgeingReport', element: <CreditorsAgeing /> },
          {
            path: 'CreditorAgeingSetupConfiguration/:groupID/:factoryID',
            element: <CreditorsAgeingConfigurationSetup />
          }
        ]
      },
      {
        path: 'valuationReport',
        element: <ValuationReport />
      },

      {
        path: 'InventoryView',
        element: <InventoryView />
      },
      {
        path: 'GradeWiseAverageReport',
        element: <GradeWiseAverageReport />
      },
      {
        path: 'SellingMarkWiseGradeReport',
        element: <SellingMarkWiseGradeReport />
      },
      {
        path: 'SellingMarkWiseSalesReport',
        element: <SellingMarkWiseSalesReport />
      },
      {
        path: 'CustomerWelfare',
        element: <CustomerWelfare />
      },
      {
        path: 'CustomerSavings',
        element: <CustomerSavings />
      },
      {
        path: 'StockViewReport',
        element: <StockViewReport />
      },
      {
        path: 'employeeCardActive',
        element: <EmployeeCardActiveListing />
      },
      {
        path: 'Payment',
        children: [
          { path: 'listing', element: <PaymentListing /> },
          {
            path: 'addEdit/:referenceNumber/:groupID/:factoryID',
            element: <PaymentAddEdit />
          },
          {
            path:
              'view/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation/:referenceNumber',
            element: <PaymentView />
          },
          {
            path: 'approve/:referenceNumber/:groupID/:factoryID',
            element: <PaymentApprove />
          }
        ]
      },
      {
        path: 'Receiving',
        children: [
          { path: 'listing', element: <ReceivingListing /> },
          {
            path: 'addEdit/:referenceNumber/:groupID/:factoryID',
            element: <ReceivingAddEdit />
          },
          {
            path:
              'view/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation/:referenceNumber',
            element: <ReceivingView />
          },
          {
            path: 'approve/:referenceNumber/:groupID/:factoryID',
            element: <ReceivingApprove />
          }
        ]
      },
      {
        path: 'OpeningBalance',
        element: <OpeningBalance />
      },
      {
        path: 'StaffAttendance',
        children: [
          {
            path: 'listing',
            element: <StaffEmployeeAttendancesListing />
          },
          {
            path: 'addEdit',
            element: <MarkStaffAttendance />
          }
        ]
      },
      {
        path: 'staffWages',
        children: [
          { path: 'listing', element: <StaffWages /> },
          { path: 'viewStaffWages/:id', element: <StaffWagesView /> }
        ]
      },
      {
        path: 'staffAttendanceView',
        element: <StaffAttendanceView />
      },
      {
        path: 'employeeLeaveForm',
        children: [
          {
            path: 'listing',
            element: <EmployeeLeaveFormListing />
          },
          {
            path: 'addEdit/:leaveRefNo',
            element: <EmployeeLeaveFormAddEdit />
          }
        ]
      },
      {
        path: 'leaveType',
        children: [
          {
            path: 'listing',
            element: <LeaveTypeListing />
          },
          {
            path: 'addEdit/:leaveTypeConfigurationID',
            element: <LeaveTypeAddEdit />
          }
        ]
      },
      {
        path: 'jobWiseAreaCovered',
        children: [
          { path: 'listing', element: <JobWiseAreaCoveredView /> },
          {
            path: 'addEdit/:jobWiseAreaCoveredID',
            element: <JobWiseAreaCoveredAdding />
          }
        ]
      },
      {
        path: 'BuyerwiseGradeSalesReport',
        element: <BuyerwiseGradeSalesReport />
      },

      {
        path: 'employeeCardPrint',
        element: <EmployeeCardPrintFiltering />
      },
      {
        path: 'employeeCardSuspend',
        element: <EmployeeCardSuspendListing />
      },
      {
        path: 'requisition',
        children: [
          {
            path: 'listing',
            element: <RequisitionListing />
          },
          {
            path: 'addEdit',
            element: <RequisitionAddEdit />
          },
          {
            path: 'quotationInquiry',
            element: <QuotationInquiry />
          }
        ]
      },

      {
        path: 'employeeCardRegenerate',
        element: <EmployeeCardRegenerate />
      },

      {
        path: 'taskTemplate',
        children: [
          {
            path: 'listing',
            element: <TaskTemplateListing />
          },
          {
            path: 'addEdit/:employeeTaskTemplateID',
            element: <TaskTemplateAddEdit />
          }
        ]
      },
      {
        path: 'taskCategory',
        children: [
          { path: 'Listing', element: <TaskCategoryListing /> },
          { path: 'addEdit/:estateTaskID', element: <TaskCategoryAddEdit /> }
        ]
      },
      {
        path: 'tasks',
        children: [
          { path: 'Listing', element: <TaskListing /> },
          { path: 'addEdit/:taskID', element: <TaskAddEdit /> }
        ]
      },
      {
        path: 'gangRegistration',
        children: [
          { path: 'listing', element: <GangRegistrationListing /> },
          { path: 'addEdit/:gangID', element: <GangRegistrationAddEdit /> }
        ]
      },
      {
        path: 'employeeCardCreation',
        children: [
          { path: 'listing', element: <EmployeeCardCreationListing /> },
          { path: 'addedit', element: <EmployeeCardCreationAddEdit /> }
        ]
      },
      {
        path: 'employeeCardAssign',
        children: [
          { path: 'listing', element: <EmployeeCardAssignListing /> },
          { path: 'addEdit/:empID', element: <EmployeeCardAssignAddEdit /> }
        ]
      },
      {
        path: 'VehicleRegistration',
        children: [
          { path: 'listing', element: <VehicleRegistrationListing /> },
          {
            path: 'addEdit/:vehicleID',
            element: <VehicleRegistrationAddEdit />
          }
        ]
      },
      {
        path: 'VehicleType',
        children: [
          { path: 'listing', element: <VehicleTypeListing /> },
          {
            path: 'addEdit/:vehicleTypeID',
            element: <VehicleTypeAddEdit />
          }
        ]
      },
      {
        path: 'deductionTemplate',
        children: [
          { path: 'listing', element: <DeductionListing /> },
          { path: 'addEdit/:deductionID', element: <DeductionAddEdit /> }
        ]
      },
      {
        path: 'roleMobileMenu',
        children: [
          { path: 'listing', element: <RoleMobileMenuListing /> },
          {
            path: 'addEdit/:roleMobileMenuID',
            element: <RoleMobileMenuAddEdit />
          }
        ]
      },
      {
        path: 'package',
        children: [
          { path: 'listing', element: <PackageListing /> },
          { path: 'addEdit/:packageID', element: <AddEditPackage /> }
        ]
      },
      {
        path: 'employeeBiometricDetailsReport',
        element: <EmployeeBiometricDetailsReport />
      },
      {
        path: 'dailyNonPluckingAttendanceReport',
        element: <DailyNonPluckingAttendanceReport />
      },
      {
        path: 'employeeDetailsReport',
        element: <EmployeeDetailsReport />
      },
      {
        path: 'dailyPluckingDetailsReport',
        element: <DailyAttendanceSessionWiseReport />
      },
      {
        path: 'ignoreSession',
        children: [
          { path: 'listing', element: <IgnoreSession /> },
          {
            path: 'addEdit/:ignoreSessionID',
            element: <IgnoreSessionAddEdit />
          }
        ]
      },
      {
        path: 'DivisionProductMapping',
        children: [
          { path: 'listing', element: <DivisionProductMappingListing /> },
          { path: 'addEdit/:divisionProductMappingID', element: <DivisionProductMappingAddEdit /> }
        ]
      },
      {
        path: 'offDayCashPaymentReport',
        element: <OffDayCashPaymentReport />
      },
      {
        path: 'offDayCashPaymentReportNonPlucking',
        element: <OffDayCashPaymentReportNonplucking />
      },
      {
        path: 'costCenterConfiguration',
        children: [
          { path: 'listing', element: <CostCenterConfigurationListing /> },
          {
            path: 'addEdit/:configurationID',
            element: <CostCenterConfigurationAddEdit />
          }
        ]
      },
      {
        path: 'gardenLeaveTypeConfiguration',
        children: [
          { path: 'listing', element: <GardenLeaveTypeConfigurationListing /> },
          {
            path: 'addEdit/:leaveTypeConfigurationID',
            element: <GardenLeaveTypeConfigurationAdd />
          }
        ]
      },
      {
        path: 'dailyPluckingAttendanceReport',
        element: <DailyAttendaceReport />
      },
      {
        path: 'dailyGeneralJobPaymentDetailsReport',
        element: <GeneralJobPaymentDetailsReport />
      },
      {
        path: 'dailyMorningCashJobPaymentDetailsReport',
        element: <DailyCashJobPaymentDetailsReport />
      },
      {
        path: 'DailyHarvesterPerformancesReport',
        element: <DailyHarvesterPerformancesReport />
      },
      {
        path: 'DailyPaymentCalculation',
        children: [{ path: 'listing', element: <DailyPaymentCalculation /> }]
      },
      {
        path: 'labourCheckListReport',
        element: <LabourCheckListReport />
      },
      {
        path: 'dailySectionPerformanceReport',
        element: <DailyFieldPerformanceReport />
      },
      {
        path: 'SectionWiseDailyPluckingReport',
        element: <SectionWiseDailyPluckingReport />
      },
      {
        path: 'DailyLabourReport',
        element: <DailyLabourReport />
      },
      {
        path: 'MusterChitReport',
        element: <MusterChitReport />
      },
      {
        path: 'dailyNonPluckingJobPaymentDetailsReport',
        element: <DailyNonPluckingJobPaymentDetailsReport />
      },
      {
        path: 'weeklyPaymentReport',
        element: <WeeklyPaymentReport />
      },
      {
        path: 'weeklyPaymentSheet',
        element: <WeeklyPaymentSheet />
      },
      {
        path: 'GreenLeafIntake',
        element: <GreenLeafIntakeReport />
      },
      {
        path: 'WorkerAttendanceReport',
        element: <WorkerAttendanceReport />
      },
      {
        path: 'WorkerAttendanceNonPlukingReport',
        element: <WorkerAttendanceNonPlukingReport />
      },
      {
        path: 'PluckingReport',
        element: <PluckingReport />
      },
      {
        path: 'dailyOutsiderJobPaymentReport',
        element: <DailyOutsiderJobPaymentReport />
      },
      {
        path: 'leave',
        children: [
          { path: 'listing', element: <LeaveListing /> },
          { path: 'addEdit/:employeeLeaveMasterID', element: <LeaveAddEdit /> }
        ]
      },
      {
        path: 'weeklyOutisderPaymentReport',
        element: <WeeklyOutsiderPaymentReport />
      },
      {
        path: 'weeklyCashPaymentReport',
        element: <WeeklyCashPaymentReport />
      },
      {
        path: 'weeklyNonPluckingPaymentReport',
        element: <WeeklyNonPluckingPaymentReport />
      },
      {
        path: 'weeklyOutsiderNonPluckingReport',
        element: <WeeklyOutsiderNonPluckingPaymentReport />
      },
      {
        path: 'LeafChitReport',
        element: <LeafChitReport />
      },
      {
        path: 'dailyAttendanceSummaryReport',
        element: <DailyAttendaceSummaryReport />
      },

      {
        path: 'dailyNonPluckingActivityReport',
        element: <DailyNonPluckingActivityReport />
      },
      {
        path: 'weeklyMorningCashPaymentReport',
        element: <WeeklyMorningCashPaymentReport />
      },
      {
        path: 'leaveBalanceReport',
        element: <LeaveBalanceReport />
      },
      {
        path: 'NonPluckingAmendment',
        children: [
          { path: 'listing', element: <NonPluckingAmendment /> }
        ]
      },
      {
        path: 'leaveHistoryReport',
        element: <LeaveHistoryReport />
      },
      {
        path: 'otherDeduction',
        children: [
          { path: 'listing', element: <OtherDeductionListing /> },
          { path: 'addEdit/:otherDeductionID', element: <OtherDeductionAddEdit /> }
        ]
      },
      {
        path: 'otherDeductionBulkUpload',
        element: <OtherDeductionBulkUploadAddEdit />
      },
      {
        path: 'additionDeduction',
        element: <AdditionDeduction />
      },
      {
        path: 'dailyReconciliationExecution',
        children: [{ path: 'listing', element: <DailyReconciliationExecution /> }]
      },
      {
        path: 'reconciliationReport',
        element: <ReconciliationReport />
      },
      {
        path: 'eoddetailsreport',
        element: <EODDetailsReport />
      },
      {
        path: 'DailyAttendanceReportMoreThanOneTask',
        element: <DailyAttendanceReportMoreThanOneTask />
      },
      {
        path: 'WeeklySalaryCompleteReport',
        element: <WeeklySalaryCompleteReport />
      },
      {
        path: 'TaskDetailReport',
        element: <TaskDetailReport />
      },
      {
        path: 'weeklyOutsiderSalaryCompleteReport',
        element: <WeeklyOutsiderSalaryCompleteReport />
      },
      {
        path: 'weeklyMorningCashSalaryCompleteReport',
        element: <WeeklyMorningCashSalaryCompleteReport />
      },
      {
        path: 'weeklyRationDeductionReport',
        element: <WeeklyRationDeductionReport />
      },
      {
        path: 'katchaReport',
        element: <KatchaReport />
      },
      {
        path: 'dailyWagesMorningReport',
        element: <DailyWagesMorningReport />
      },
      {
        path: 'dailyWagesReport',
        element: <DailyWagesReport />
      },
      {
        path: 'dailyOutsiderWagesReport',
        element: <DailyOutsiderWagesReport />
      },
      {
        path: 'landDistribution',
        children: [
          { path: 'Listing', element: <ViewLandDistribution /> },
          { path: 'addEdit/:landDistributionID', element: <AddEditLandDistribution /> }
        ]
      },
      {
        path: 'LeaveEligibilityBulkUpload',
        children: [
          { path: 'Listing', element: <LeaveEligibilityBulkUploadListing /> },
          { path: 'addEdit/:employeeLeaveMasterID', element: <LeaveEligibilityBulkUploadAddEdit /> }
        ]
      },
      {
        path: 'employeeLeaveBulk',
        children: [
          {
            path: 'listing',
            element: <EmployeeLeaveBulkListing />
          },
          {
            path: 'addEdit/:leaveRefNo',
            element: <EmployeeLeaveBulkAddEdit />
          }
        ]
      },
      {
        path: 'grantAreasAndLabourOnBookReport',
        element: <GrantAreasAndLabourOnBookReport />
      },
      {
        path: 'fieldDetailsReport',
        element: <FieldDetailsReport />
      },
      {
        path: 'landDistributionDetailsReport',
        element: <LandDistributionDetailsReport />
      },
      {
        path: 'supplementaryDetailsReport',
        element: <SupplementaryDetailsReport />
      },
      {
        path: 'rationDeduction',
        element: <RationDeduction />
      },
      {
        path: 'employeeRegistrationCardReport',
        element: <EmployeeRegistrationCardReport />
      },
      {
        path: 'rationEntitlementReport',
        element: <RationEntitlementReport />
      },
      {
        path: 'fieldHistoryReport',
        element: <FieldHistoryDetailsReport />
      },
      {
        path: 'nonPluckingAttendanceReport',
        element: <NonPluckingAttendanceReport />
      },
      {
        path: 'taskReport',
        element: <TaskReport />
      },
      {
        path: 'taskSummaryReport',
        element: <TaskSummaryReport />
      },
      {
        path: 'RationConfiguration',
        children: [
          { path: 'listing', element: <RationConfigurationListing /> },
          { path: 'addEdit/:rationConfigurationID', element: <RationConfigurationAddEdit /> }
        ]
      },
      {
        path: 'biometricSummaryReport',
        element: <BiometricSummaryReport />
      },
      {
        path: 'DailyWeighmentRegistery',
        element: <DailyWeighmentRegistery />
      },
      {
        path: 'employeeAvailedReport',
        element: <EmployeeAvailedReport />
      },
      {
        path: 'EmployeeTransferReport',
        element: <EmployeeTransferReport />
      },
      {
        path: 'PruningDetailsReport',
        element: <PruningDetailsReport />
      },
      {
        path: 'workLocationPayPointUpdate',
        element: <WorkLocationPayPointUpdate />
      },
      {
        path: 'weeklyRationExecution',
        element: <WeeklyRationExecution />
      },
      {
        path: 'holidaycalendar',
        element: <HolidayCalendarScreen />
      },
      {
        path: 'EmployeeProfile',
        element: <EmployeeProfile />
      },
      {
        path: 'dailyPluckingReconciliationReport',
        element: <DailyPluckingReconciliationReport />
      },
      {
        path: 'dailyNonPluckingReconciliationReport',
        element: <DailyNonPluckingReconciliationReport />
      },
      {
        path: 'AbsentListReport',
        element: <AbsentListReport />
      },
      {
        path: 'dailykatchaReport',
        element: <DailyKatchaReport />
      },
      {
        path: 'ElectricityDeduction',
        children: [
          { path: 'listing', element: <ElectricityDeductionListing /> },
          { path: 'addEdit/:electricityDeductionID', element: <ElectricityDeductionAddEdit /> }
        ]
      },

      {
        path: 'paypointExceptionReport',
        element: <PaypointExceptionReport />
      },
      {
        path: 'employeeLeave',
        children: [
          {
            path: 'listing',
            element: <EmployeeLeaveAddEdit />
          },
        ]
      },
      {
        path: 'shortLeaveApproval',
        children: [
          {
            path: 'listing',
            element: <ShortLeaveApprovalListing />
          },
          {
            path: 'addEdit/:leaveRefNo',
            element: <ShortLeaveApprovalAddEdit />
          }
        ]
      },
      {
        path: 'employeeLeaveCancellation',
        element: <EmployeeLeaveCancellation />
      },

      {
        path: 'pFDeductionReport',
        element: <PFDeductionReport />
      },
      {
        path: 'pluckingAmendment',
        children: [
          { path: 'listing', element: <PluckingAmendmentListing /> },
          { path: 'addEdit', element: <PluckingAmendmentAdd /> }
        ]    
      },
      {
        path: 'dailyLeaveBalanceReport',
        element: <DailyLeaveBalanceReport />
      },
      {
        path: 'transferAttendance',
        element: <TransferAttendanceListing />
      },
      {
        path: 'factoryWeighment',
        children: [
          {
            path: 'listing',
            element: <FactoryWeighmentAdd />
          },
        ]
      },
      {
        path: 'PluckingAttendanceReport',
        element: <PluckingAttendanceReport />
      },
      {
        path: 'Factoryweighmentreport',
        element: <FactoryWeighmentReport/>

      },
    
    ]
  },
  

  {
    path: '/',
    //element: !isLoggedIn ? <MainLayout /> : <Navigate to='/app/dashboard' />,
    children: [
      { path: 'login', element: <LoginView /> },
      { path: 'register', element: <RegisterView /> },
      {
        path: 'newLoader',
        element: <LottieLoadingComponent />
      },
      { path: '404', element: <NotFoundView /> },
      { path: '/', element: <Navigate to="/newLoader" /> },
      { path: '*', element: <Navigate to="/404" /> }
    ]
  },
  {
    path: 'newLoader',
    element: <LottieLoadingComponent />
  }

];

export default routes;
