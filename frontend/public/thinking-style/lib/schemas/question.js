/**
 * Mentara Labs | Learning Profile Check
 * Question Bank Schema Validator (Zod-style lightweight validation)
 */

export const QuestionSchema = {
  validate(item) {
    const errors = [];

    if (!item.id || typeof item.id !== 'string') {
      errors.push('Item id is required and must be a string');
    }
    if (typeof item.stage !== 'number' || item.stage < 1 || item.stage > 5) {
      errors.push('Stage must be a number between 1 and 5');
    }
    if (!item.strand || typeof item.strand !== 'string') {
      errors.push('Strand is required (e.g., "number", "fractions", "geometry", "measure")');
    }
    if (typeof item.difficulty !== 'number' || item.difficulty < 1 || item.difficulty > 5) {
      errors.push('Difficulty must be a number from 1 to 5');
    }
    if (!item.stem || typeof item.stem !== 'string') {
      errors.push('Stem is required');
    }
    if (!Array.isArray(item.options) || item.options.length < 2) {
      errors.push('Options must be an array with at least 2 choices');
    } else {
      const hasCorrect = item.options.some(opt => opt.correct === true);
      if (!hasCorrect) {
        errors.push(`Question ${item.id} has no correct option`);
      }
      item.options.forEach((opt, idx) => {
        if (!opt.text) errors.push(`Option ${idx} in ${item.id} is missing text`);
        if (typeof opt.correct !== 'boolean') errors.push(`Option ${idx} in ${item.id} missing correct boolean`);
      });
    }

    // Two-tier diagnostic reasoning options validation (Part C requirement)
    if (item.reasoningOptions) {
      if (!Array.isArray(item.reasoningOptions) || item.reasoningOptions.length < 2) {
        errors.push(`reasoningOptions for ${item.id} must be an array of at least 2 reasoning statements`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validateBank(bank) {
    if (!Array.isArray(bank)) {
      return { isValid: false, count: 0, errors: ['Question bank must be an array'] };
    }
    const allErrors = [];
    bank.forEach((q, index) => {
      const res = this.validate(q);
      if (!res.isValid) {
        allErrors.push(`Item #${index} (${q.id || 'unknown'}): ${res.errors.join('; ')}`);
      }
    });

    return {
      isValid: allErrors.length === 0,
      count: bank.length,
      errors: allErrors
    };
  }
};
