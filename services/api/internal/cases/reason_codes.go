package cases

var FixedReasonCodes = []ReasonCode{
	{Code: "TITLE_SEARCH_CLEAN", Label: "Title search found no material blocker", Category: ReasonCategoryClearSupport, SortOrder: 10},
	{Code: "ENCUMBRANCE_CHECK_CLEAN", Label: "Encumbrance check found no active blocker", Category: ReasonCategoryClearSupport, SortOrder: 20},
	{Code: "OWNERSHIP_CHAIN_CONFIRMED", Label: "Ownership chain aligns with supplied matter", Category: ReasonCategoryClearSupport, SortOrder: 30},
	{Code: "ACTIVE_INTERDICT", Label: "Active interdict or transfer restriction found", Category: ReasonCategoryHardBlock, IsHardBlock: true, SortOrder: 100},
	{Code: "TITLE_DEED_MISMATCH", Label: "Supplied title reference conflicts with evidence", Category: ReasonCategoryHardBlock, IsHardBlock: true, SortOrder: 110},
	{Code: "REGISTERED_BOND_CONFLICT", Label: "Registered bond or encumbrance conflicts with matter", Category: ReasonCategoryHardBlock, IsHardBlock: true, SortOrder: 120},
	{Code: "OWNERSHIP_CONFLICT", Label: "Current owner evidence conflicts with supplied matter", Category: ReasonCategoryReviewTrigger, SortOrder: 200},
	{Code: "PARTY_NAME_VARIANCE", Label: "Party name or entity details require review", Category: ReasonCategoryReviewTrigger, SortOrder: 210},
	{Code: "SOURCE_CONFLICT", Label: "Available sources disagree on material facts", Category: ReasonCategoryReviewTrigger, SortOrder: 220},
	{Code: "FRAUD_SIGNAL_PRESENT", Label: "Fraud or anomaly signal requires review", Category: ReasonCategoryReviewTrigger, SortOrder: 230},
	{Code: "MISSING_TITLE_REFERENCE", Label: "Title reference missing or unverifiable", Category: ReasonCategoryUnresolvedInformation, SortOrder: 300},
	{Code: "INSUFFICIENT_SOURCE_COVERAGE", Label: "Available evidence is insufficient for a defensible decision", Category: ReasonCategoryUnresolvedInformation, SortOrder: 310},
}
