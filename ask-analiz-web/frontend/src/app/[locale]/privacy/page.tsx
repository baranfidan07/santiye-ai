export default function PrivacyPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto bg-black min-h-screen text-zinc-400 overflow-y-auto pb-32 text-sm leading-relaxed text-justify">
            <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
            <p className="mb-8 text-xs text-zinc-500 uppercase tracking-widest">Last Updated: December 25, 2025</p>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">Article I. Preamble</h2>
                <p className="mb-4">
                    This Privacy Policy ("Policy") governs the collection, processing, usage, and dissemination of personal data by AskAnaliz ("Company," "we," "us," or "our") in connection with the utilization of our artificial intelligence-driven relationship analysis platform (“Services”). By accessing or utilizing the Services, you (“User” or “Data Subject”) explicitly consent to the data practices delineated herein. If you dissent from any provision of this Policy, you are mandated to immediately discontinue the use of the Services.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">Article II. Data Collection Framework</h2>
                <p className="mb-2">We collect and process the following categories of data pursuant to the necessity of service provision and legitimate business interests:</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-zinc-600">
                    <li>
                        <strong>Personally Identifiable Information (PII):</strong> Including but not limited to full legal names, electronic mail addresses, and authentication tokens derived from third-party identity providers (e.g., Google OAuth protocol).
                    </li>
                    <li>
                        <strong>User-Generated Content (UGC):</strong> All textual submissions, queries, uploaded media, and contextual metadata provided by the User for analysis.
                    </li>
                    <li>
                        <strong>Telemetry and Usage Metrics:</strong> Device identifiers, IP addresses, browser fingerprints, session duration, and interaction heatmaps collected via automated tracking technologies.
                    </li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">Article III. Usage and Processing Protocols</h2>
                <p className="mb-4">
                    The collected data is utilized for the following primary objectives: (a) the algorithmic generation of relationship insights; (b) the iterative refinement of our machine learning models (on an anonymized and aggregated basis); (c) the enforcement of community standards and prevention of fraudulent activities; and (d) compliance with applicable statutory and regulatory obligations.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">Article IV. Third-Party Disclosures</h2>
                <p className="mb-4">
                    We do not engage in the commercial sale of PII. However, we reserve the right to disclose data to: (i) cloud infrastructure providers (e.g., Google Cloud Platform, Supabase) strictly for operational hosting; (ii) large language model (LLM) inference providers under strict data processing agreements; and (iii) law enforcement agencies strictly upon receipt of a valid judicial subpoena or court order.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">Article V. Data Retention & Erasure</h2>
                <p className="mb-4">
                    Data is retained for the duration necessary to fulfill the purposes outlined in this Policy unless a longer retention period is required by law. Users retain the right to request the permanent erasure of their account and associated PII ("Right to be Forgotten") by submitting a formal request to our designated Data Protection Officer at support@askanaliz.com.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">Article VI. Amendments</h2>
                <p className="mb-4">
                    AskAnaliz reserves the unilateral right to amend, modify, or supersede this Policy at any time without prior individual notice. Continued use of the Service following the posting of changes constitutes your binding acceptance of such changes.
                </p>
            </section>
        </div>
    );
}
