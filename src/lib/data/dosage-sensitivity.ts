/**
 * ClinGen Dosage Sensitivity curations — embedded static data.
 *
 * Source: https://search.clinicalgenome.org/kb/gene-dosage
 * Last updated: 2026-03. These are key dosage sensitivity curations from the
 * ClinGen Dosage Sensitivity Curation Working Group.
 *
 * Haploinsufficiency (HI) scores — evidence for disease due to loss of one copy:
 *   0 — No evidence for haploinsufficiency
 *   1 — Little evidence for haploinsufficiency
 *   2 — Some evidence for haploinsufficiency (emerging)
 *   3 — Sufficient evidence for haploinsufficiency
 *  40 — Autosomal recessive (gene dosage sensitivity unlikely)
 *
 * Triplosensitivity (TS) scores — evidence for disease due to gain of one copy:
 *   0 — No evidence for triplosensitivity
 *   1 — Little evidence for triplosensitivity
 *   2 — Some evidence for triplosensitivity (emerging)
 *   3 — Sufficient evidence for triplosensitivity
 *  40 — Autosomal recessive (gene dosage sensitivity unlikely)
 */

export interface DosageSensitivityEntry {
	gene_symbol: string;
	hgnc_id: string;
	hi_score: 0 | 1 | 2 | 3 | 40;
	ts_score: 0 | 1 | 2 | 3 | 40;
	hi_description: string;
	ts_description: string;
	review_date: string;
}

export const dosageSensitivityEntries: DosageSensitivityEntry[] = [
	{
		gene_symbol: "FBN1",
		hgnc_id: "HGNC:3603",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants in FBN1 cause Marfan syndrome (AD). Numerous truncating variants identified in affected individuals.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-08-15",
	},
	{
		gene_symbol: "SHANK3",
		hgnc_id: "HGNC:14294",
		hi_score: 3,
		ts_score: 1,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Deletions and loss-of-function variants in SHANK3 cause Phelan-McDermid syndrome with intellectual disability and autism features.",
		ts_description:
			"Little evidence for triplosensitivity. Duplications of the 22q13.3 region including SHANK3 have been reported but clinical significance is less established.",
		review_date: "2022-09-01",
	},
	{
		gene_symbol: "MECP2",
		hgnc_id: "HGNC:6990",
		hi_score: 3,
		ts_score: 3,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants cause Rett syndrome (XLD) in females. Males typically have severe neonatal encephalopathy.",
		ts_description:
			"Sufficient evidence for triplosensitivity. MECP2 duplication syndrome causes intellectual disability, recurrent infections, and progressive spasticity, primarily in males.",
		review_date: "2022-07-11",
	},
	{
		gene_symbol: "RAI1",
		hgnc_id: "HGNC:9834",
		hi_score: 3,
		ts_score: 3,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Heterozygous loss of RAI1 causes Smith-Magenis syndrome with intellectual disability, behavioral abnormalities, and sleep disturbance.",
		ts_description:
			"Sufficient evidence for triplosensitivity. Duplication of 17p11.2 (Potocki-Lupski syndrome) including RAI1 causes developmental delay, hypotonia, and autistic features.",
		review_date: "2022-06-20",
	},
	{
		gene_symbol: "PMP22",
		hgnc_id: "HGNC:9118",
		hi_score: 3,
		ts_score: 3,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Deletion of PMP22 (or loss-of-function variants) causes hereditary neuropathy with liability to pressure palsies (HNPP).",
		ts_description:
			"Sufficient evidence for triplosensitivity. Duplication of 17p12 including PMP22 causes Charcot-Marie-Tooth disease type 1A (CMT1A), the most common inherited peripheral neuropathy.",
		review_date: "2022-05-16",
	},
	{
		gene_symbol: "SCN1A",
		hgnc_id: "HGNC:10585",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants in SCN1A cause Dravet syndrome (severe myoclonic epilepsy of infancy). Over 80% of cases have de novo SCN1A variants.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-04-18",
	},
	{
		gene_symbol: "BRCA1",
		hgnc_id: "HGNC:1100",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Heterozygous loss-of-function variants significantly increase risk of breast and ovarian cancer. Well-established tumor suppressor gene.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-03-14",
	},
	{
		gene_symbol: "TP53",
		hgnc_id: "HGNC:11998",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Heterozygous loss-of-function variants cause Li-Fraumeni syndrome with predisposition to a wide spectrum of early-onset cancers.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-03-14",
	},
	{
		gene_symbol: "NF1",
		hgnc_id: "HGNC:7765",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants cause neurofibromatosis type 1 with cafe-au-lait macules, neurofibromas, and increased cancer risk.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-04-04",
	},
	{
		gene_symbol: "PTEN",
		hgnc_id: "HGNC:9588",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants cause PTEN hamartoma tumor syndrome (Cowden syndrome) with increased cancer risk and macrocephaly.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-04-11",
	},
	{
		gene_symbol: "RB1",
		hgnc_id: "HGNC:9884",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Heterozygous loss-of-function variants cause hereditary retinoblastoma. Classic two-hit tumor suppressor gene.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-05-02",
	},
	{
		gene_symbol: "KCNQ1",
		hgnc_id: "HGNC:6294",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants cause long QT syndrome type 1 (Romano-Ward syndrome). Reduced IKs potassium current prolongs cardiac repolarization.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-03-28",
	},
	{
		gene_symbol: "PKD1",
		hgnc_id: "HGNC:9008",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants cause autosomal dominant polycystic kidney disease type 1 (ADPKD1). Most common inherited kidney disease.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-06-06",
	},
	{
		gene_symbol: "MYH7",
		hgnc_id: "HGNC:7577",
		hi_score: 0,
		ts_score: 0,
		hi_description:
			"No evidence for haploinsufficiency. MYH7-associated cardiomyopathy is primarily caused by missense variants acting through a dominant-negative or gain-of-function mechanism.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-04-25",
	},
	{
		gene_symbol: "LMNA",
		hgnc_id: "HGNC:6636",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Truncating variants in LMNA cause dilated cardiomyopathy with conduction defects and high risk of sudden cardiac death.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-05-09",
	},
	{
		gene_symbol: "TSC1",
		hgnc_id: "HGNC:12362",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants in TSC1 cause tuberous sclerosis complex with hamartomas, seizures, and developmental delay.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-05-23",
	},
	{
		gene_symbol: "TSC2",
		hgnc_id: "HGNC:12363",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants in TSC2 cause tuberous sclerosis complex, typically with more severe disease than TSC1.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-05-23",
	},
	{
		gene_symbol: "DMD",
		hgnc_id: "HGNC:2928",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Complete loss-of-function causes Duchenne muscular dystrophy (XLR). Partial loss-of-function (in-frame deletions) causes the milder Becker muscular dystrophy.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-06-13",
	},
	{
		gene_symbol: "APC",
		hgnc_id: "HGNC:583",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants cause familial adenomatous polyposis (FAP) with hundreds to thousands of colorectal polyps and near-certain colon cancer.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-03-07",
	},
	{
		gene_symbol: "CFTR",
		hgnc_id: "HGNC:1884",
		hi_score: 40,
		ts_score: 0,
		hi_description:
			"Gene associated with autosomal recessive disease. Heterozygous carriers of CFTR variants are unaffected. Cystic fibrosis requires biallelic loss-of-function variants.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-04-04",
	},
	{
		gene_symbol: "SMN1",
		hgnc_id: "HGNC:11117",
		hi_score: 40,
		ts_score: 0,
		hi_description:
			"Gene associated with autosomal recessive disease. Spinal muscular atrophy requires biallelic (typically homozygous deletion) loss of SMN1. Carriers are unaffected.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-07-04",
	},
	{
		gene_symbol: "PAH",
		hgnc_id: "HGNC:8582",
		hi_score: 40,
		ts_score: 0,
		hi_description:
			"Gene associated with autosomal recessive disease. Phenylketonuria requires biallelic PAH variants. Carriers have mildly elevated phenylalanine but no clinical phenotype.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-05-30",
	},
	{
		gene_symbol: "HBB",
		hgnc_id: "HGNC:4827",
		hi_score: 40,
		ts_score: 0,
		hi_description:
			"Gene associated with autosomal recessive disease. Sickle cell disease and beta-thalassemia require biallelic HBB variants. Sickle cell trait (carrier) is generally asymptomatic.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-06-20",
	},
	{
		gene_symbol: "FOXG1",
		hgnc_id: "HGNC:3811",
		hi_score: 3,
		ts_score: 2,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants cause FOXG1 syndrome with severe intellectual disability, microcephaly, and corpus callosum agenesis.",
		ts_description:
			"Some evidence for triplosensitivity. Duplications encompassing FOXG1 have been associated with epilepsy and developmental delay, but evidence is still emerging.",
		review_date: "2022-08-01",
	},
	{
		gene_symbol: "MBD5",
		hgnc_id: "HGNC:20444",
		hi_score: 3,
		ts_score: 2,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Deletions and loss-of-function variants cause 2q23.1 microdeletion syndrome with intellectual disability, seizures, and behavioral abnormalities.",
		ts_description:
			"Some evidence for triplosensitivity. 2q23.1 duplications including MBD5 have been reported with developmental delay but evidence is still emerging.",
		review_date: "2022-07-18",
	},
	{
		gene_symbol: "EHMT1",
		hgnc_id: "HGNC:24650",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants cause Kleefstra syndrome with intellectual disability, hypotonia, and characteristic facies.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-08-08",
	},
	{
		gene_symbol: "KANSL1",
		hgnc_id: "HGNC:24565",
		hi_score: 3,
		ts_score: 0,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants cause Koolen-de Vries syndrome (17q21.31 microdeletion syndrome) with intellectual disability and friendly behavior.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2022-07-25",
	},
	{
		gene_symbol: "DYRK1A",
		hgnc_id: "HGNC:3091",
		hi_score: 3,
		ts_score: 2,
		hi_description:
			"Sufficient evidence for haploinsufficiency. Loss-of-function variants cause DYRK1A-related intellectual disability syndrome with microcephaly, feeding difficulties, and seizures.",
		ts_description:
			"Some evidence for triplosensitivity. DYRK1A lies within the Down syndrome critical region on chromosome 21; trisomy 21 includes an extra copy, contributing to intellectual disability.",
		review_date: "2022-09-05",
	},
	{
		gene_symbol: "HTT",
		hgnc_id: "HGNC:4851",
		hi_score: 0,
		ts_score: 0,
		hi_description:
			"No evidence for haploinsufficiency. Huntington disease is caused by a toxic gain-of-function (CAG trinucleotide repeat expansion), not by loss of gene function.",
		ts_description:
			"No evidence for triplosensitivity. Duplications of HTT have not been associated with disease.",
		review_date: "2022-06-27",
	},
];

/**
 * Filter dosage sensitivity entries by optional criteria.
 */
export function filterDosageSensitivity(filters?: {
	gene?: string;
	hi_score?: number;
	ts_score?: number;
	search?: string;
}): DosageSensitivityEntry[] {
	let results = dosageSensitivityEntries;

	if (filters?.gene) {
		const g = filters.gene.toUpperCase();
		results = results.filter((r) => r.gene_symbol.toUpperCase() === g);
	}
	if (filters?.hi_score !== undefined) {
		results = results.filter((r) => r.hi_score === filters.hi_score);
	}
	if (filters?.ts_score !== undefined) {
		results = results.filter((r) => r.ts_score === filters.ts_score);
	}
	if (filters?.search) {
		const q = filters.search.toLowerCase();
		results = results.filter(
			(r) =>
				r.gene_symbol.toLowerCase().includes(q) ||
				r.hi_description.toLowerCase().includes(q) ||
				r.ts_description.toLowerCase().includes(q) ||
				r.hgnc_id.toLowerCase().includes(q),
		);
	}

	return results;
}

/**
 * Find dosage sensitivity data for a specific gene.
 */
export function findDosageSensitivity(geneSymbol: string): DosageSensitivityEntry | undefined {
	const g = geneSymbol.toUpperCase();
	return dosageSensitivityEntries.find((r) => r.gene_symbol.toUpperCase() === g);
}
