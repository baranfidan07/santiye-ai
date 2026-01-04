export default function GDPRPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto bg-[#0A0A0F] min-h-screen text-zinc-400 overflow-y-auto pb-32 text-sm leading-relaxed text-justify">
            <h1 className="text-3xl font-bold text-white mb-2">GDPR Compliance</h1>
            <p className="mb-8 text-xs text-zinc-500 uppercase tracking-widest">Effective Date: January 1, 2026</p>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">1. Introduction</h2>
                <p className="mb-4">
                    AskAnaliz ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal data. This General Data Protection Regulation (GDPR) Compliance Statement explains how we collect, use, process, and store your data in compliance with EU regulations.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">2. Data We Collect</h2>
                <p className="mb-4">
                    We adhere to the principle of data minimization. We only collect data that is strictly necessary for the functionality of our Vertical AI services:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>Account Information:</strong> Email address and basic profile details if you create an account.</li>
                    <li><strong>Input Data:</strong> Text and screenshots you voluntarily upload for analysis are processed transiently.</li>
                    <li><strong>Usage Data:</strong> Anonymized metrics regarding feature usage to improve our AI models.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">3. How We Use Your Data</h2>
                <p className="mb-4">
                    Your data is processed primarily to provide the specific AI analysis you request.
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>AI Processing:</strong> Inputs are sent to our secure LLM pipeline for analysis and are not permanently stored for model training without your explicit consent.</li>
                    <li><strong>Service Improvement:</strong> We use aggregated, non-personally identifiable information to refine accuracy.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">4. Your Rights Under GDPR</h2>
                <p className="mb-4">
                    As a user, you have the following fundamental rights:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
                    <li><strong>Right to Rectification:</strong> Correction of inaccurate or incomplete data.</li>
                    <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your personal data from our systems.</li>
                    <li><strong>Right to Restriction of Processing:</strong> Limit how we use your data.</li>
                    <li><strong>Right to Data Portability:</strong> Receive your data in a structured, commonly used format.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">5. Data Security</h2>
                <p className="mb-4">
                    We implement enterprise-grade security measures, including end-to-end encryption for data in transit and at rest. Our systems are regularly audited to prevent unauthorized access, alteration, or destruction of data.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-bold text-zinc-200 mb-3 border-b border-zinc-800 pb-2">6. Contact Us</h2>
                <p className="mb-4">
                    To exercise your rights or if you have questions regarding this policy, please contact our Data Protection Officer (DPO) at:
                </p>
                <p className="font-bold text-white">
                    Email: <a href="mailto:info@askanaliz.com" className="text-purple-500 hover:text-purple-400 transition">info@askanaliz.com</a>
                </p>
                <p className="mt-2 text-zinc-500">
                    Sivas Cumhuriyet University<br />
                    Sivas, Turkey
                </p>
            </section>
        </div>
    );
}
