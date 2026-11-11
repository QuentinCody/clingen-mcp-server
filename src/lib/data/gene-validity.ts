/**
 * ClinGen Gene-Disease Validity curations — embedded static data.
 *
 * Source: https://search.clinicalgenome.org/kb/gene-validity
 * Source-reviewed partial subset. The original
 * 2026-03 label is not a verified dataset release; see per-row source_checked_on.
 *
 * Classification labels (retain the SOP version of each source assertion):
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

import type { GeneValidityCuration } from "./validity-types";
import { reviewedCancerValidity } from "./validity-cancer";
import { reviewedHereditaryCancerValidity } from "./validity-hereditary-cancer";
import { reviewedPgxGeneValidity } from "./validity-pgx-reviewed";
import { reviewedCardiovascularValidity } from "./validity-cardiovascular";
import { reviewedMultisystemValidity } from "./validity-multisystem";
export type { GeneValidityCuration } from "./validity-types";

export const geneValidityCurations: GeneValidityCuration[] = [
  ...reviewedCancerValidity,
  ...reviewedHereditaryCancerValidity,

  ...reviewedCardiovascularValidity,

  ...reviewedPgxGeneValidity,
  ...reviewedMultisystemValidity,
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
