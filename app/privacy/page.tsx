export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent font-mono p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">ODINSMASH Extension Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-medium mb-2">1. Introduction</h2>
            <p className="text-sm">
              This Privacy Policy explains how the ODINSMASH browser extension ("we", "our", or "us") collects, uses, and protects your information. By using our extension, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">2. Information We Collect</h2>
            <p className="text-sm">
              The ODINSMASH extension collects the following types of information:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li><strong>Token URLs:</strong> When you analyze a token, we collect the token URL to provide analysis results.</li>
              <li><strong>Analysis Results:</strong> We temporarily store analysis results locally in your browser for recent checks functionality.</li>
              <li><strong>Extension Usage Data:</strong> We may collect anonymous usage statistics to improve the extension's performance and features.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">3. How We Use Your Information</h2>
            <p className="text-sm">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>To provide token analysis services</li>
              <li>To maintain a history of recent token checks (stored locally in your browser)</li>
              <li>To improve and optimize the extension's functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">4. Data Storage and Security</h2>
            <p className="text-sm">
              All data collected by the extension is stored locally in your browser. We do not store any personal information on our servers. The extension uses standard browser storage mechanisms (chrome.storage.local) to maintain your recent checks history.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">5. Third-Party Services</h2>
            <p className="text-sm">
              The extension interacts with the following third-party services:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li><strong>Odin.fun:</strong> To fetch token data for analysis</li>
              <li><strong>ODINSMASH API:</strong> To perform token analysis</li>
            </ul>
            <p className="text-sm mt-2">
              We do not share your data with any other third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">6. Your Rights</h2>
            <p className="text-sm">
              You have the following rights regarding your data:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>Access your recent checks history through the extension's interface</li>
              <li>Clear your recent checks history at any time</li>
              <li>Uninstall the extension to remove all locally stored data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">7. Changes to This Privacy Policy</h2>
            <p className="text-sm">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">8. Contact Us</h2>
            <p className="text-sm">
              If you have any questions about this Privacy Policy, please contact us at odinsmashinc@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 