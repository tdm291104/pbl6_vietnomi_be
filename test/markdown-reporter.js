class MarkdownReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
    const { numFailedTests, numPassedTests, numPendingTests, testResults, startTime } = results;
    const duration = (Date.now() - startTime) / 1000;

    let testDetailsData = [];
    const testDetailsPath = require('path').join(process.cwd(), 'test-details.json');

    try {
      if (require('fs').existsSync(testDetailsPath)) {
        const fileContent = require('fs').readFileSync(testDetailsPath, 'utf8');
        testDetailsData = fileContent ? JSON.parse(fileContent) : [];
        console.log(`\n📊 Reporter - Found ${testDetailsData.length} test case details from file`);
        if (testDetailsData.length > 0) {
          console.log('✅ First test case:', testDetailsData[0].testName);
        }
      } else {
        console.log(`\n⚠️ Reporter - test-details.json file not found`);
      }
    } catch (err) {
      console.error(`\n❌ Reporter - Error reading test details:`, err.message);
      testDetailsData = [];
    }

    let markdown = '# BÁO CÁO KIỂM THỬ UNIT TEST\n\n';
    markdown += `> **Thời gian thực hiện**: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n\n`;
    markdown += `> **Tổng thời gian**: ${duration.toFixed(2)} giây\n\n`;

    markdown += '---\n\n';
    markdown += '## TỔNG QUAN KẾT QUẢ\n\n';

    const totalTests = numPassedTests + numFailedTests + numPendingTests;
    const passRate = totalTests > 0 ? ((numPassedTests / totalTests) * 100).toFixed(2) : 0;

    markdown += `| Trạng thái | Số lượng | Tỷ lệ |\n`;
    markdown += `|-----------|----------|-------|\n`;
    markdown += `| Thành công | ${numPassedTests} | ${passRate}% |\n`;
    markdown += `| Thất bại | ${numFailedTests} | ${totalTests > 0 ? ((numFailedTests / totalTests) * 100).toFixed(2) : 0}% |\n`;
    markdown += `| Bỏ qua | ${numPendingTests} | ${totalTests > 0 ? ((numPendingTests / totalTests) * 100).toFixed(2) : 0}% |\n`;
    markdown += `| **Tổng cộng** | **${totalTests}** | **100%** |\n\n`;

    const overallStatus = numFailedTests === 0 ? 'PASSED' : 'FAILED';
    const statusColor = numFailedTests === 0 ? '🟢' : '🔴';
    markdown += `### ${statusColor} Trạng thái tổng thể: **${overallStatus}**\n\n`;

    markdown += '---\n\n';
    markdown += '## CHI TIẾT CÁC TEST SUITE\n\n';

    testResults.forEach((testResult, index) => {
      const fileName = require('path').basename(testResult.testFilePath);
      const filePath = require('path').relative(process.cwd(), testResult.testFilePath);
      const suitePassed = testResult.numFailingTests === 0;
      const suiteIcon = suitePassed ? '✅' : '❌';
      const suiteStatus = suitePassed ? 'THÀNH CÔNG' : 'THẤT BẠI';

      markdown += `### ${index + 1}. ${suiteIcon} ${fileName}\n\n`;
      markdown += `**Đường dẫn**: \`${filePath}\`\n\n`;
      markdown += `**Thời gian thực thi**: ${(testResult.perfStats.runtime / 1000).toFixed(3)} giây\n\n`;
      markdown += `**Kết quả**:\n`;
      markdown += `- Thành công: ${testResult.numPassingTests}\n`;
      markdown += `- Thất bại: ${testResult.numFailingTests}\n`;
      markdown += `- Bỏ qua: ${testResult.numPendingTests}\n`;
      markdown += `- **Trạng thái**: **${suiteStatus}**\n\n`;

      if (testResult.testResults.length > 0) {
        markdown += '#### CHI TIẾT CÁC TEST CASE\n\n';

        const groupedTests = {};
        testResult.testResults.forEach((test) => {
          const groupName = test.ancestorTitles.join(' → ') || 'Root';
          if (!groupedTests[groupName]) {
            groupedTests[groupName] = [];
          }
          groupedTests[groupName].push(test);
        });

        let testCounter = 1;
        Object.keys(groupedTests).forEach((groupName) => {
          if (groupName !== 'Root') {
            markdown += `##### ${groupName}\n\n`;
          }

          groupedTests[groupName].forEach((test) => {
            const status = test.status === 'passed' ? 'Thành công' : 
                          test.status === 'failed' ? 'Thất bại' : 
                          'Bỏ qua';
            const statusIcon = test.status === 'passed' ? '✅' : 
                              test.status === 'failed' ? '❌' : '⏭️';
            const duration = test.duration ? `${test.duration}ms` : 'N/A';

            const testDetail = testDetailsData.find(d => d.testName === test.title);

            markdown += `<details>\n`;
            markdown += `<summary><strong>${testCounter}. ${statusIcon} ${test.title}</strong> (${duration})</summary>\n\n`;

            markdown += `**Mô tả**: ${test.title}\n\n`;
            markdown += `**Thời gian**: ${duration}\n\n`;
            markdown += `**Trạng thái**: ${status}\n\n`;

            if (testDetail) {
              markdown += `**DỮ LIỆU ĐẦU VÀO (Input)**:\n\n`;
              markdown += '```json\n';
              markdown += JSON.stringify(testDetail.input, null, 2);
              markdown += '\n```\n\n';

              markdown += `**KẾT QUẢ MONG ĐỢI (Expected)**:\n\n`;
              markdown += '```json\n';
              markdown += JSON.stringify(testDetail.expected, null, 2);
              markdown += '\n```\n\n';

              markdown += `**KẾT QUẢ THỰC TẾ (Actual)**:\n\n`;
              markdown += '```json\n';
              markdown += JSON.stringify(testDetail.actual, null, 2);
              markdown += '\n```\n\n';

              const isMatch = JSON.stringify(testDetail.expected) === JSON.stringify(testDetail.actual);

              if (isMatch) {
                markdown += `**Đánh giá**: Test case PASS - Chức năng hoạt động đúng logic.\n\n`;
              } else {
                markdown += `**Đánh giá**: Test case FAIL - Cần kiểm tra lại logic.\n\n`;

                markdown += `**Chi tiết sự khác biệt**:\n`;
                markdown += `- **Expected**: \`${JSON.stringify(testDetail.expected)}\`\n`;
                markdown += `- **Actual**: \`${JSON.stringify(testDetail.actual)}\`\n\n`;
              }
            }

            if (test.fullName) {
              markdown += `**Tên đầy đủ**: \`${test.fullName}\`\n\n`;
            }

            if (test.failureMessages && test.failureMessages.length > 0) {
              markdown += `**LỖI CHI TIẾT**:\n\n`;
              markdown += '```\n';
              markdown += test.failureMessages.join('\n');
              markdown += '\n```\n\n';
            }

            markdown += `</details>\n\n`;
            testCounter++;
          });
        });
      }
    });

    const reportPath = require('path').join(process.cwd(), 'test-report.md');
    require('fs').writeFileSync(reportPath, markdown);
    console.log(`\n📊 Báo cáo Markdown đã được tạo: ${reportPath}\n`);

    // Do not delete test-details.json for debugging
    // fs.unlinkSync(testDetailsPath);
  }
}

module.exports = MarkdownReporter;
