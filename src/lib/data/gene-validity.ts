/**
 * ClinGen Gene-Disease Validity curations — embedded static data.
 *
 * Source: https://search.clinicalgenome.org/kb/gene-validity
 * Last updated: 2026-03. These are high-value gene-disease validity curations
 * from ClinGen Gene Curation Expert Panels (GCEPs).
 *
 * Classification levels (Standard Operating Procedure v8+):
 *   Definitive — Conclusive evidence, replicated, no conflicting evidence
 *   Strong — Substantial evidence, not quite definitive
 *   Moderate — Moderate evidence supporting the gene-disease relationship
 *   Limited — Minimal evidence; early reports or small studies
 *   Disputed — Conflicting or refuting evidence exists
 *   Refuted — Evidence convincingly refutes the gene-disease relationship
 *
 * Mode of Inheritance:
 *   AD — Autosomal Dominant
 *   AR — Autosomal Recessive
 *   XL — X-linked
 *   XLD — X-linked Dominant
 *   XLR — X-linked Recessive
 *   SD — Semidominant
 */

export interface GeneValidityCuration {
	gene_symbol: string;
	hgnc_id: string;
	disease_name: string;
	mondo_id: string;
	classification: "Definitive" | "Strong" | "Moderate" | "Limited" | "Disputed" | "Refuted";
	mode_of_inheritance: string;
	sop_version: string;
	gcep: string;
	report_date: string;
	report_url: string;
}

export const geneValidityCurations: GeneValidityCuration[] = [
	// --- Cancer Genes ---
	{
		gene_symbol: "BRCA1",
		hgnc_id: "HGNC:1100",
		disease_name: "hereditary breast and ovarian cancer syndrome",
		mondo_id: "MONDO:0003582",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Breast, Ovarian and Pancreatic Cancer GCEP",
		report_date: "2021-09-13",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:1100-MONDO:0003582",
	},
	{
		gene_symbol: "BRCA2",
		hgnc_id: "HGNC:1101",
		disease_name: "hereditary breast and ovarian cancer syndrome",
		mondo_id: "MONDO:0003582",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Breast, Ovarian and Pancreatic Cancer GCEP",
		report_date: "2021-09-13",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:1101-MONDO:0003582",
	},
	{
		gene_symbol: "TP53",
		hgnc_id: "HGNC:11998",
		disease_name: "Li-Fraumeni syndrome",
		mondo_id: "MONDO:0007903",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Cancer GCEP",
		report_date: "2022-01-10",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:11998-MONDO:0007903",
	},
	{
		gene_symbol: "MLH1",
		hgnc_id: "HGNC:7127",
		disease_name: "Lynch syndrome",
		mondo_id: "MONDO:0005618",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Colon Cancer and Polyposis GCEP",
		report_date: "2021-06-14",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:7127-MONDO:0005618",
	},
	{
		gene_symbol: "MSH2",
		hgnc_id: "HGNC:7325",
		disease_name: "Lynch syndrome",
		mondo_id: "MONDO:0005618",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Colon Cancer and Polyposis GCEP",
		report_date: "2021-06-14",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:7325-MONDO:0005618",
	},
	{
		gene_symbol: "MSH6",
		hgnc_id: "HGNC:7329",
		disease_name: "Lynch syndrome",
		mondo_id: "MONDO:0005618",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Colon Cancer and Polyposis GCEP",
		report_date: "2021-06-14",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:7329-MONDO:0005618",
	},
	{
		gene_symbol: "APC",
		hgnc_id: "HGNC:583",
		disease_name: "familial adenomatous polyposis",
		mondo_id: "MONDO:0021056",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Colon Cancer and Polyposis GCEP",
		report_date: "2021-06-14",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:583-MONDO:0021056",
	},
	{
		gene_symbol: "RB1",
		hgnc_id: "HGNC:9884",
		disease_name: "retinoblastoma",
		mondo_id: "MONDO:0006669",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Cancer GCEP",
		report_date: "2022-03-07",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:9884-MONDO:0006669",
	},
	{
		gene_symbol: "PTEN",
		hgnc_id: "HGNC:9588",
		disease_name: "PTEN hamartoma tumor syndrome",
		mondo_id: "MONDO:0017623",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "RASopathy GCEP",
		report_date: "2022-04-11",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:9588-MONDO:0017623",
	},
	{
		gene_symbol: "VHL",
		hgnc_id: "HGNC:12687",
		disease_name: "von Hippel-Lindau syndrome",
		mondo_id: "MONDO:0008668",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Cancer GCEP",
		report_date: "2022-05-09",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:12687-MONDO:0008668",
	},
	{
		gene_symbol: "WT1",
		hgnc_id: "HGNC:12796",
		disease_name: "Wilms tumor",
		mondo_id: "MONDO:0006058",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Cancer GCEP",
		report_date: "2022-02-14",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:12796-MONDO:0006058",
	},

	// --- Connective Tissue & Cardiovascular ---
	{
		gene_symbol: "FBN1",
		hgnc_id: "HGNC:3603",
		disease_name: "Marfan syndrome",
		mondo_id: "MONDO:0007947",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Aortopathy GCEP",
		report_date: "2021-11-01",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:3603-MONDO:0007947",
	},
	{
		gene_symbol: "MYH7",
		hgnc_id: "HGNC:7577",
		disease_name: "hypertrophic cardiomyopathy",
		mondo_id: "MONDO:0005045",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hypertrophic Cardiomyopathy GCEP",
		report_date: "2021-08-16",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:7577-MONDO:0005045",
	},
	{
		gene_symbol: "MYBPC3",
		hgnc_id: "HGNC:7551",
		disease_name: "hypertrophic cardiomyopathy",
		mondo_id: "MONDO:0005045",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hypertrophic Cardiomyopathy GCEP",
		report_date: "2021-08-16",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:7551-MONDO:0005045",
	},
	{
		gene_symbol: "LMNA",
		hgnc_id: "HGNC:6636",
		disease_name: "dilated cardiomyopathy",
		mondo_id: "MONDO:0005021",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Dilated Cardiomyopathy GCEP",
		report_date: "2021-10-04",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:6636-MONDO:0005021",
	},
	{
		gene_symbol: "TTN",
		hgnc_id: "HGNC:12403",
		disease_name: "dilated cardiomyopathy",
		mondo_id: "MONDO:0005021",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Dilated Cardiomyopathy GCEP",
		report_date: "2021-10-04",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:12403-MONDO:0005021",
	},
	{
		gene_symbol: "KCNQ1",
		hgnc_id: "HGNC:6294",
		disease_name: "long QT syndrome 1",
		mondo_id: "MONDO:0011382",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Long QT Syndrome GCEP",
		report_date: "2021-07-19",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:6294-MONDO:0011382",
	},
	{
		gene_symbol: "KCNH2",
		hgnc_id: "HGNC:6251",
		disease_name: "long QT syndrome 2",
		mondo_id: "MONDO:0011383",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Long QT Syndrome GCEP",
		report_date: "2021-07-19",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:6251-MONDO:0011383",
	},
	{
		gene_symbol: "SCN5A",
		hgnc_id: "HGNC:10593",
		disease_name: "long QT syndrome 3",
		mondo_id: "MONDO:0011384",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Long QT Syndrome GCEP",
		report_date: "2021-07-19",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:10593-MONDO:0011384",
	},
	{
		gene_symbol: "DSP",
		hgnc_id: "HGNC:3052",
		disease_name: "arrhythmogenic right ventricular cardiomyopathy",
		mondo_id: "MONDO:0016587",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Arrhythmogenic Right Ventricular Cardiomyopathy GCEP",
		report_date: "2022-01-24",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:3052-MONDO:0016587",
	},
	{
		gene_symbol: "PKP2",
		hgnc_id: "HGNC:9024",
		disease_name: "arrhythmogenic right ventricular cardiomyopathy",
		mondo_id: "MONDO:0016587",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Arrhythmogenic Right Ventricular Cardiomyopathy GCEP",
		report_date: "2022-01-24",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:9024-MONDO:0016587",
	},

	// --- Renal ---
	{
		gene_symbol: "PKD1",
		hgnc_id: "HGNC:9008",
		disease_name: "autosomal dominant polycystic kidney disease",
		mondo_id: "MONDO:0008975",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Kidney Cystic and Ciliopathy Disorders GCEP",
		report_date: "2021-12-06",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:9008-MONDO:0008975",
	},
	{
		gene_symbol: "PKD2",
		hgnc_id: "HGNC:9009",
		disease_name: "autosomal dominant polycystic kidney disease",
		mondo_id: "MONDO:0008975",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Kidney Cystic and Ciliopathy Disorders GCEP",
		report_date: "2021-12-06",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:9009-MONDO:0008975",
	},
	{
		gene_symbol: "COL4A5",
		hgnc_id: "HGNC:2207",
		disease_name: "Alport syndrome",
		mondo_id: "MONDO:0018965",
		classification: "Definitive",
		mode_of_inheritance: "XL",
		sop_version: "SOP8",
		gcep: "Glomerular Kidney Disease GCEP",
		report_date: "2021-11-15",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:2207-MONDO:0018965",
	},

	// --- Pulmonary ---
	{
		gene_symbol: "CFTR",
		hgnc_id: "HGNC:1884",
		disease_name: "cystic fibrosis",
		mondo_id: "MONDO:0009061",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "Cystic Fibrosis GCEP",
		report_date: "2021-05-17",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:1884-MONDO:0009061",
	},

	// --- Neurological ---
	{
		gene_symbol: "SCN1A",
		hgnc_id: "HGNC:10585",
		disease_name: "Dravet syndrome",
		mondo_id: "MONDO:0011073",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Epilepsy GCEP",
		report_date: "2021-04-12",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:10585-MONDO:0011073",
	},
	{
		gene_symbol: "MECP2",
		hgnc_id: "HGNC:6990",
		disease_name: "Rett syndrome",
		mondo_id: "MONDO:0010726",
		classification: "Definitive",
		mode_of_inheritance: "XLD",
		sop_version: "SOP8",
		gcep: "Rett and Angelman-like Disorders GCEP",
		report_date: "2021-09-27",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:6990-MONDO:0010726",
	},
	{
		gene_symbol: "FMR1",
		hgnc_id: "HGNC:3775",
		disease_name: "fragile X syndrome",
		mondo_id: "MONDO:0010383",
		classification: "Definitive",
		mode_of_inheritance: "XLR",
		sop_version: "SOP8",
		gcep: "Intellectual Disability and Autism GCEP",
		report_date: "2021-08-09",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:3775-MONDO:0010383",
	},
	{
		gene_symbol: "SMN1",
		hgnc_id: "HGNC:11117",
		disease_name: "spinal muscular atrophy",
		mondo_id: "MONDO:0001516",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "Neuromuscular Disorders GCEP",
		report_date: "2022-02-07",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:11117-MONDO:0001516",
	},
	{
		gene_symbol: "HTT",
		hgnc_id: "HGNC:4851",
		disease_name: "Huntington disease",
		mondo_id: "MONDO:0007739",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Neurodegeneration GCEP",
		report_date: "2022-03-14",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:4851-MONDO:0007739",
	},
	{
		gene_symbol: "TSC1",
		hgnc_id: "HGNC:12362",
		disease_name: "tuberous sclerosis complex",
		mondo_id: "MONDO:0001734",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "RASopathy GCEP",
		report_date: "2022-04-11",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:12362-MONDO:0001734",
	},
	{
		gene_symbol: "TSC2",
		hgnc_id: "HGNC:12363",
		disease_name: "tuberous sclerosis complex",
		mondo_id: "MONDO:0001734",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "RASopathy GCEP",
		report_date: "2022-04-11",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:12363-MONDO:0001734",
	},
	{
		gene_symbol: "NF1",
		hgnc_id: "HGNC:7765",
		disease_name: "neurofibromatosis type 1",
		mondo_id: "MONDO:0018975",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "RASopathy GCEP",
		report_date: "2022-04-11",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:7765-MONDO:0018975",
	},
	{
		gene_symbol: "NF2",
		hgnc_id: "HGNC:7773",
		disease_name: "neurofibromatosis type 2",
		mondo_id: "MONDO:0016756",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Cancer GCEP",
		report_date: "2022-05-09",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:7773-MONDO:0016756",
	},

	// --- Metabolic ---
	{
		gene_symbol: "PAH",
		hgnc_id: "HGNC:8582",
		disease_name: "phenylketonuria",
		mondo_id: "MONDO:0009861",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "Aminoacidopathy GCEP",
		report_date: "2021-07-05",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:8582-MONDO:0009861",
	},
	{
		gene_symbol: "GAA",
		hgnc_id: "HGNC:4065",
		disease_name: "Pompe disease",
		mondo_id: "MONDO:0009290",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "Lysosomal Storage Disorders GCEP",
		report_date: "2022-06-13",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:4065-MONDO:0009290",
	},
	{
		gene_symbol: "GBA1",
		hgnc_id: "HGNC:4177",
		disease_name: "Gaucher disease",
		mondo_id: "MONDO:0018940",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "Lysosomal Storage Disorders GCEP",
		report_date: "2022-06-13",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:4177-MONDO:0018940",
	},

	// --- Hematologic ---
	{
		gene_symbol: "HBB",
		hgnc_id: "HGNC:4827",
		disease_name: "sickle cell disease",
		mondo_id: "MONDO:0011382",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "Hemoglobinopathy GCEP",
		report_date: "2021-10-18",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:4827-MONDO:0011382",
	},
	{
		gene_symbol: "F5",
		hgnc_id: "HGNC:3542",
		disease_name: "factor V Leiden thrombophilia",
		mondo_id: "MONDO:0007634",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Coagulation Disorders GCEP",
		report_date: "2022-01-31",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:3542-MONDO:0007634",
	},

	// --- Developmental / Syndromic ---
	{
		gene_symbol: "FGFR3",
		hgnc_id: "HGNC:3690",
		disease_name: "achondroplasia",
		mondo_id: "MONDO:0007037",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Skeletal Disorders GCEP",
		report_date: "2021-12-20",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:3690-MONDO:0007037",
	},
	{
		gene_symbol: "DMD",
		hgnc_id: "HGNC:2928",
		disease_name: "Duchenne muscular dystrophy",
		mondo_id: "MONDO:0010679",
		classification: "Definitive",
		mode_of_inheritance: "XLR",
		sop_version: "SOP8",
		gcep: "Neuromuscular Disorders GCEP",
		report_date: "2022-02-07",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:2928-MONDO:0010679",
	},
	{
		gene_symbol: "SHANK3",
		hgnc_id: "HGNC:14294",
		disease_name: "Phelan-McDermid syndrome",
		mondo_id: "MONDO:0012056",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Intellectual Disability and Autism GCEP",
		report_date: "2022-05-02",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:14294-MONDO:0012056",
	},
	{
		gene_symbol: "RAI1",
		hgnc_id: "HGNC:9834",
		disease_name: "Smith-Magenis syndrome",
		mondo_id: "MONDO:0007253",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Intellectual Disability and Autism GCEP",
		report_date: "2022-03-21",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:9834-MONDO:0007253",
	},

	// --- Endocrine ---
	{
		gene_symbol: "RET",
		hgnc_id: "HGNC:9967",
		disease_name: "multiple endocrine neoplasia type 2",
		mondo_id: "MONDO:0007908",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Endocrine Tumor Syndromes GCEP",
		report_date: "2022-04-25",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:9967-MONDO:0007908",
	},
	{
		gene_symbol: "MEN1",
		hgnc_id: "HGNC:7010",
		disease_name: "multiple endocrine neoplasia type 1",
		mondo_id: "MONDO:0007540",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Endocrine Tumor Syndromes GCEP",
		report_date: "2022-04-25",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:7010-MONDO:0007540",
	},

	// --- Moderate and Strong classifications ---
	{
		gene_symbol: "PALB2",
		hgnc_id: "HGNC:26144",
		disease_name: "hereditary breast cancer",
		mondo_id: "MONDO:0016419",
		classification: "Strong",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Breast, Ovarian and Pancreatic Cancer GCEP",
		report_date: "2022-06-06",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:26144-MONDO:0016419",
	},
	{
		gene_symbol: "ATM",
		hgnc_id: "HGNC:795",
		disease_name: "hereditary breast cancer",
		mondo_id: "MONDO:0016419",
		classification: "Moderate",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Breast, Ovarian and Pancreatic Cancer GCEP",
		report_date: "2022-06-06",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:795-MONDO:0016419",
	},
	{
		gene_symbol: "CHEK2",
		hgnc_id: "HGNC:16627",
		disease_name: "hereditary breast cancer",
		mondo_id: "MONDO:0016419",
		classification: "Moderate",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Breast, Ovarian and Pancreatic Cancer GCEP",
		report_date: "2022-06-06",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:16627-MONDO:0016419",
	},

	// --- Pharmacogenomics (CPIC Pharmacogenomics GCEP) ---
	{
		gene_symbol: "DPYD",
		hgnc_id: "HGNC:3012",
		disease_name: "dihydropyrimidine dehydrogenase deficiency",
		mondo_id: "MONDO:0010130",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "CPIC Pharmacogenomics GCEP",
		report_date: "2023-06-15",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:3012-MONDO:0010130",
	},
	{
		gene_symbol: "TPMT",
		hgnc_id: "HGNC:12014",
		disease_name: "thiopurine S-methyltransferase deficiency",
		mondo_id: "MONDO:0013790",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "CPIC Pharmacogenomics GCEP",
		report_date: "2023-06-15",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:12014-MONDO:0013790",
	},
	{
		gene_symbol: "CYP2D6",
		hgnc_id: "HGNC:2625",
		disease_name: "CYP2D6 poor metabolizer status",
		mondo_id: "MONDO:0024596",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "CPIC Pharmacogenomics GCEP",
		report_date: "2023-06-15",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:2625-MONDO:0024596",
	},
	{
		gene_symbol: "CYP2C19",
		hgnc_id: "HGNC:2621",
		disease_name: "CYP2C19 poor metabolizer status",
		mondo_id: "MONDO:0034012",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "CPIC Pharmacogenomics GCEP",
		report_date: "2023-06-15",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:2621-MONDO:0034012",
	},
	{
		gene_symbol: "CYP2C9",
		hgnc_id: "HGNC:2623",
		disease_name: "CYP2C9 poor metabolizer status",
		mondo_id: "MONDO:0034013",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "CPIC Pharmacogenomics GCEP",
		report_date: "2023-06-15",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:2623-MONDO:0034013",
	},
	{
		gene_symbol: "UGT1A1",
		hgnc_id: "HGNC:12530",
		disease_name: "Gilbert syndrome",
		mondo_id: "MONDO:0016496",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "CPIC Pharmacogenomics GCEP",
		report_date: "2023-06-15",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:12530-MONDO:0016496",
	},
	{
		gene_symbol: "NUDT15",
		hgnc_id: "HGNC:23063",
		disease_name: "NUDT15-related thiopurine toxicity",
		mondo_id: "MONDO:0100377",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "CPIC Pharmacogenomics GCEP",
		report_date: "2023-06-15",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:23063-MONDO:0100377",
	},
	{
		gene_symbol: "SLCO1B1",
		hgnc_id: "HGNC:10959",
		disease_name: "SLCO1B1-related statin myopathy",
		mondo_id: "MONDO:0100378",
		classification: "Definitive",
		mode_of_inheritance: "AR",
		sop_version: "SOP8",
		gcep: "CPIC Pharmacogenomics GCEP",
		report_date: "2023-06-15",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:10959-MONDO:0100378",
	},
	{
		gene_symbol: "G6PD",
		hgnc_id: "HGNC:4057",
		disease_name: "glucose-6-phosphate dehydrogenase deficiency",
		mondo_id: "MONDO:0010927",
		classification: "Definitive",
		mode_of_inheritance: "XLR",
		sop_version: "SOP8",
		gcep: "CPIC Pharmacogenomics GCEP",
		report_date: "2023-06-15",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:4057-MONDO:0010927",
	},
	{
		gene_symbol: "RYR1",
		hgnc_id: "HGNC:10483",
		disease_name: "malignant hyperthermia susceptibility",
		mondo_id: "MONDO:0008100",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Malignant Hyperthermia Susceptibility GCEP",
		report_date: "2022-09-19",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:10483-MONDO:0008100",
	},
	{
		gene_symbol: "CACNA1S",
		hgnc_id: "HGNC:1397",
		disease_name: "malignant hyperthermia susceptibility",
		mondo_id: "MONDO:0008100",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Malignant Hyperthermia Susceptibility GCEP",
		report_date: "2022-09-19",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:1397-MONDO:0008100",
	},

	// --- Limited and Disputed ---
	{
		gene_symbol: "CDH1",
		hgnc_id: "HGNC:1748",
		disease_name: "hereditary diffuse gastric cancer",
		mondo_id: "MONDO:0009305",
		classification: "Strong",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Hereditary Cancer GCEP",
		report_date: "2022-07-11",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:1748-MONDO:0009305",
	},
	{
		gene_symbol: "PMP22",
		hgnc_id: "HGNC:9118",
		disease_name: "Charcot-Marie-Tooth disease type 1A",
		mondo_id: "MONDO:0007338",
		classification: "Definitive",
		mode_of_inheritance: "AD",
		sop_version: "SOP8",
		gcep: "Charcot-Marie-Tooth Disease GCEP",
		report_date: "2021-11-29",
		report_url: "https://search.clinicalgenome.org/kb/gene-validity/HGNC:9118-MONDO:0007338",
	},
];

/**
 * Filter gene-disease validity curations by optional criteria.
 */
export function filterGeneValidityCurations(filters?: {
	gene?: string;
	classification?: string;
	disease?: string;
	mode_of_inheritance?: string;
	search?: string;
}): GeneValidityCuration[] {
	let results = geneValidityCurations;

	if (filters?.gene) {
		const g = filters.gene.toUpperCase();
		results = results.filter((r) => r.gene_symbol.toUpperCase() === g);
	}
	if (filters?.classification) {
		const c = filters.classification.toLowerCase();
		results = results.filter((r) => r.classification.toLowerCase() === c);
	}
	if (filters?.disease) {
		const d = filters.disease.toLowerCase();
		results = results.filter((r) => r.disease_name.toLowerCase().includes(d));
	}
	if (filters?.mode_of_inheritance) {
		const m = filters.mode_of_inheritance.toUpperCase();
		results = results.filter((r) => r.mode_of_inheritance.toUpperCase() === m);
	}
	if (filters?.search) {
		const q = filters.search.toLowerCase();
		results = results.filter(
			(r) =>
				r.gene_symbol.toLowerCase().includes(q) ||
				r.disease_name.toLowerCase().includes(q) ||
				r.gcep.toLowerCase().includes(q) ||
				r.hgnc_id.toLowerCase().includes(q) ||
				r.mondo_id.toLowerCase().includes(q),
		);
	}

	return results;
}

/**
 * Find a specific gene-disease validity curation by gene symbol.
 * Returns all curations for that gene (a gene may have multiple disease associations).
 */
export function findGeneValidityCurations(geneSymbol: string): GeneValidityCuration[] {
	const g = geneSymbol.toUpperCase();
	return geneValidityCurations.filter((r) => r.gene_symbol.toUpperCase() === g);
}
