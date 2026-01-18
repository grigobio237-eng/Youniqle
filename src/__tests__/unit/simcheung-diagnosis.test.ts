
import { SimcheungDiagnosisEngine, DiagnosisQuestion } from '../../lib/logic/simcheung-diagnosis';

describe('SimcheungDiagnosisEngine', () => {
    // Mock Questions: 2 Domains (N, E), 2 Facets each domain, 2 Items each facet = 8 Questions
    const mockQuestions: DiagnosisQuestion[] = [
        { id: 1, domain: 'N', facet: 1, isReverseKey: false },
        { id: 2, domain: 'N', facet: 1, isReverseKey: true }, // Reverse
        { id: 3, domain: 'N', facet: 2, isReverseKey: false },
        { id: 4, domain: 'N', facet: 2, isReverseKey: false },
        { id: 5, domain: 'E', facet: 1, isReverseKey: false },
        { id: 6, domain: 'E', facet: 1, isReverseKey: false },
        { id: 7, domain: 'E', facet: 2, isReverseKey: true },
        { id: 8, domain: 'E', facet: 2, isReverseKey: false },
        { id: 9, domain: 'O', facet: 1, isReverseKey: false }, // Filler to reach 10 items
        { id: 10, domain: 'O', facet: 1, isReverseKey: false },
    ];

    test('should calculate correct scores with full answers', () => {
        const answers = {
            1: 5, 2: 5, // N1: 5 + (6-5) = 6
            3: 3, 4: 3, // N2: 3 + 3 = 6
            5: 4, 6: 4, // E1: 4 + 4 = 8
            7: 2, 8: 5, // E2: (6-2) + 5 = 9
            9: 3, 10: 3 // O1 filler
        };

        const result = SimcheungDiagnosisEngine.calculateResults({ answers, questions: mockQuestions });

        expect(result.validity.isValid).toBe(true);
        expect(result.rawScores.facets['N1']).toBe(6);
        expect(result.rawScores.facets['N2']).toBe(6);
        expect(result.rawScores.domains['N']).toBe(12); // 6+6
        expect(result.rawScores.domains['E']).toBe(17); // 8+9
    });

    test('should handle missing data with imputation', () => {
        // Missing Q4 (part of N)
        // N answers: Q1=3, Q2=3(rev->3), Q3=3. Mean = 3.
        const answers = {
            1: 3, 2: 3, 3: 3,
            // 4 is missing
            5: 3, 6: 3, 7: 3, 8: 3,
            9: 3, 10: 3 // Filler
        };

        const result = SimcheungDiagnosisEngine.calculateResults({ answers, questions: mockQuestions });

        expect(result.metadata.missingCount).toBe(1);
        expect(result.metadata.imputedCount).toBe(1);
        // Imputed value for 4 should be mean(3,3,3) = 3
        // So N2 = 3 + 3 = 6
        expect(result.rawScores.facets['N2']).toBe(6);
    });

    test('should detect long string responding', () => {
        // 10 identical answers (need more questions for this check usually, loop 10 times)
        // Logic checks > 10. Let's make 12 questions
        const longQuestions = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, domain: 'N', facet: 1, isReverseKey: false } as DiagnosisQuestion));
        const answers: Record<number, number> = {};
        longQuestions.forEach(q => answers[q.id] = 3); // All 3

        const result = SimcheungDiagnosisEngine.calculateResults({ answers, questions: longQuestions });

        expect(result.validity.isValid).toBe(false);
        expect(result.validity.flags).toContain('LongString');
    });

    test('should calculate free diagnosis scores correctly', () => {
        // Mock 4 questions, 1 per category
        const freeQuestions = [
            { id: 'M1', category: 'Mindset', isReverse: false },
            { id: 'E1', category: 'Emotional', isReverse: false },
            { id: 'S1', category: 'Social', isReverse: false },
            { id: 'P1', category: 'Physical', isReverse: false },
            { id: 'M2', category: 'Mindset', isReverse: true } // Reverse item
        ];

        const answers = {
            'M1': 5, // 5
            'E1': 4, // 4
            'S1': 3, // 3
            'P1': 2, // 2
            'M2': 1  // Reverse: 6-1=5
        };
        // Mindset total: 5 + 5 = 10. Max for 2 items is 10.
        // Formula: (Score / 30) * 100
        // (10 / 30) * 100 = 33.333 -> 33

        const result = SimcheungDiagnosisEngine.calculateFreeDiagnosis(answers, freeQuestions);

        expect(result.rawScores['Mindset']).toBe(10);
        expect(result.rawScores['Emotional']).toBe(4);
        expect(result.rawScores['Social']).toBe(3);
        expect(result.rawScores['Physical']).toBe(2);

        expect(result.convertedScores['Mindset']).toBe(33);
        expect(result.lowestCategory).toBe('Physical'); // 2/30*100 = 7
    });
});
