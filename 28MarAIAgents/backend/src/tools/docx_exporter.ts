import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';

export async function createDocx(plan: any): Promise<Buffer> {
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ text: "Test Plan", heading: HeadingLevel.TITLE }),
                
                new Paragraph({ text: "1. Overview", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: plan.overview || "No overview provided." }),
                
                new Paragraph({ text: "2. Scope", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: plan.scope || "No scope provided." }),
                
                new Paragraph({ text: "3. Objectives", heading: HeadingLevel.HEADING_1 }),
                ...(plan.objectives || []).map((o: string) => new Paragraph({ text: o, bullet: { level: 0 } })),
                
                new Paragraph({ text: "4. Test Strategy", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: plan.test_strategy || "No strategy provided." }),
                
                new Paragraph({ text: "5. Test Types", heading: HeadingLevel.HEADING_1 }),
                ...(plan.test_types || []).map((t: string) => new Paragraph({ text: t, bullet: { level: 0 } })),
                
                new Paragraph({ text: "6. Entry & Exit Criteria", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: "Entry Criteria", heading: HeadingLevel.HEADING_2 }),
                ...(plan.entry_criteria || []).map((c: string) => new Paragraph({ text: c, bullet: { level: 0 } })),
                new Paragraph({ text: "Exit Criteria", heading: HeadingLevel.HEADING_2 }),
                ...(plan.exit_criteria || []).map((c: string) => new Paragraph({ text: c, bullet: { level: 0 } })),
                
                new Paragraph({ text: "7. Test Cases", heading: HeadingLevel.HEADING_1 }),
                
                // Add table if test cases exist
                ...(plan.test_cases && plan.test_cases.length > 0 ? [
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: ['ID', 'Jira Ref', 'Title', 'Priority', 'Steps'].map(header => 
                                    new TableCell({ children: [new Paragraph({ text: header })] })
                                )
                            }),
                            ...plan.test_cases.map((tc: any) => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: tc.id || "" })] }),
                                    new TableCell({ children: [new Paragraph({ text: tc.jira_ref || "" })] }),
                                    new TableCell({ children: [new Paragraph({ text: tc.title || "" })] }),
                                    new TableCell({ children: [new Paragraph({ text: tc.priority || "" })] }),
                                    new TableCell({ children: [new Paragraph({ text: (tc.steps || []).join('\n') })] }),
                                ]
                            }))
                        ]
                    })
                ] : [new Paragraph("No test cases generated.")]),

                new Paragraph({ text: "8. Risks & Mitigations", heading: HeadingLevel.HEADING_1 }),
                ...(plan.risks || []).map((r: string) => new Paragraph({ text: r, bullet: { level: 0 } })),
                
                new Paragraph({ text: "9. Timeline", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: plan.timeline || "No timeline provided." }),
            ]
        }]
    });

    return await Packer.toBuffer(doc);
}
