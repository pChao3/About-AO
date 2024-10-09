import React, { useEffect, useState } from 'react';
import Arweave from 'arweave';

const arweave = Arweave.init({
  host: 'ar-io.dev',
  port: 443,
  protocol: 'https',
});

const JsonImportModal = ({ isOpen, onClose }) => {
  const [jsonData, setJsonData] = useState('');

  const handleFileUpload = event => {
    const files = event.target.files;
    let accountsInfo = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async e => {
        console.log(arweave);
        const walletAddress = await arweave.wallets.jwkToAddress(JSON.parse(e.target.result));
        console.log('walletAddress', walletAddress);
        const accountInfo = {
          address: walletAddress,
          key: JSON.parse(e.target.result),
        };
        accountsInfo.push(accountInfo);
        if (i === files.length - 1) {
          setJsonData(accountsInfo); // 设置合并后的 JSON 数据
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setJsonData('');
    }
  }, isOpen);

  const handleImport = () => {
    try {
      const data = JSON.parse(localStorage.getItem('accountsInfo'));
      if (data && data.length) {
        const addressArr = data.map(i => i.address);
        const arr = [];

        const inputArr = JSON.parse(jsonData);
        for (let j = 0; j < inputArr.length; j++) {
          if (!addressArr.includes(inputArr[j].address)) {
            arr.push(inputArr[j]);
          }
        }
        localStorage.setItem('accountsInfo', JSON.stringify([...data, ...arr]));
      } else {
        localStorage.setItem('accountsInfo', JSON.stringify(jsonData));
      }
      alert('数据已成功导入！');
      setJsonData('');
      onClose(); // 关闭弹出框
    } catch (error) {
      alert('无效的 JSON 数据，请检查后重试。');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-lg font-bold mb-4">批量导入 JSON</h2>
        <input type="file" webkitdirectory="true" onChange={handleFileUpload} className="mb-4" />
        <textarea
          className="w-full h-40 border border-gray-300 p-2"
          value={jsonData}
          onChange={e => setJsonData(e.target.value)}
          placeholder="在此粘贴 JSON 数据, 必须为数组格式"
        />
        <div className="mt-4 flex justify-end">
          <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={handleImport}>
            导入
          </button>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonImportModal;
