package cases

func cleanCaseRequest() CreateCaseRequest {
	return CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
		TitleReference:            "T12345/2024",
		MatterReference:           "MAT-2026-001",
		IntakeNote:                "Clean title, no blockers expected.",
	}
}

func reviewCaseRequest() CreateCaseRequest {
	return CreateCaseRequest{
		ActorID:                   "ana-002",
		PropertyDescription:       "Section 8 SS Harbor View",
		LocalityOrArea:            "Umhlanga",
		MunicipalityOrDeedsOffice: "Durban",
		TitleReference:            "ST7788/2023",
		MatterReference:           "MAT-2026-002",
		IntakeNote:                "Ownership variance flagged.",
	}
}

func stopCaseRequest() CreateCaseRequest {
	return CreateCaseRequest{
		ActorID:                   "ana-003",
		PropertyDescription:       "Erf 91 Observatory",
		LocalityOrArea:            "Observatory",
		MunicipalityOrDeedsOffice: "Cape Town",
		TitleReference:            "T9988/2022",
		MatterReference:           "MAT-2026-003",
		IntakeNote:                "Active interdict known on property.",
	}
}

func unresolvedCaseRequest() CreateCaseRequest {
	return CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Farm Portion 17 Rietfontein",
		LocalityOrArea:            "Rietfontein",
		MunicipalityOrDeedsOffice: "Pretoria",
		MatterReference:           "MAT-2026-004",
		IntakeNote:                "Title reference missing from intake.",
	}
}
