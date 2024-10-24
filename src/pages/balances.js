import InnerPageContainer from '@/components/common/InnerPageContainer';
import PageMetaTags from '@/containers/PageMetaTags';

import { useEffect, useState } from 'react';
import { message, createDataItemSigner, result, spawn, dryrun } from '@permaweb/aoconnect/browser';
import { TokenAddress, llamaBanker, llamaCoin, llamaWaitList, names } from '@/config/Address';
import { fetchAO } from '@/fetch';

export default function Page() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true); // 初始状态设为加载中

  const [output, setOutput] = useState('');
  const [loginTime, setLoginTime] = useState(0); // 初始冷却时间
  const [pettionTime, setPettionTime] = useState(0); // 初始冷却时间

  useEffect(() => {
    init();
    // 设置定时器更新冷却时间
    const timer = setInterval(() => {
      setLoginTime(prev => (prev > 0 ? prev - 1000 : 0)); // 每秒减少1秒
    }, 1000);

    const timer1 = setInterval(() => {
      setPettionTime(prev => (prev > 0 ? prev - 1000 : 0)); // 每秒减少1秒
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(timer1);
    }; // 清除定时器
  }, []);

  const init = async () => {
    const accounts = JSON.parse(localStorage.getItem('accountsInfo')) || [];
    const data = await Promise.all(
      accounts.map(async account => {
        const infos = await getBalances(account.address);
        return { userAddress: account.address, tokensInfo: infos };
      })
    );
    setTableData(data);
    setLoading(false);

    // 从 localStorage 获取目标时间并计算剩余时间
    const targetLoginTime = JSON.parse(localStorage.getItem('targetLoginTime')) || 0;
    const targetPettionTime = JSON.parse(localStorage.getItem('targetPettionTime')) || 0;
    const currentTime = Date.now();

    // 计算剩余时间
    const remainingLoginTime = targetLoginTime - currentTime;
    const remainingPettionTime = targetPettionTime - currentTime;

    setLoginTime(remainingLoginTime > 0 ? remainingLoginTime : 0);
    setPettionTime(remainingPettionTime > 0 ? remainingPettionTime : 0);
  };
  const getBalances = async walletAddress => {
    const tokenBalances = await Promise.all(
      TokenAddress.map(async token => {
        const info = await dryrun({
          process: token.address,
          tags: [{ name: 'Action', value: 'Info' }],
        });
        const decimals = info.Messages[0].Tags.filter(i => i.name === 'Denomination')[0].value;
        const symbol = info.Messages[0].Tags.filter(i => i.name === 'Ticker')[0].value;

        const d = await dryrun({
          process: token.address,
          tags: [
            { name: 'Action', value: 'Balance' },
            { name: token.flag ? 'Target' : 'Recipient', value: walletAddress },
          ],
        });
        return {
          decimals,
          balances: d.Messages[0].Data,
          symbol,
          address: token.address,
        };
      })
    );
    return tokenBalances;
  };

  const deleteAccount = address => {
    const allAccounts = JSON.parse(localStorage.getItem('accountsInfo'));
    const data = allAccounts.filter(i => i.address !== address);
    localStorage.setItem('accountsInfo', JSON.stringify(data));
    init();
  };
  const getAccounts = () => JSON.parse(localStorage.getItem('accountsInfo')); // 替换为实际的 key

  const Action = async action => {
    const localStorageData = getAccounts(); // 替换为实际的 key
    setLoading(true);
    try {
      for (let i = 0; i < localStorageData.length; i++) {
        const key = localStorageData[i].key;

        const params = {
          key: key,
          methodName: action,
          name: names[i],
        };
        const data = await fetchAO(params);
        setOutput(`执行结果: ${data.message}`);
      }
      const currentTime = Date.now();
      if (action === 'login') {
        const targetTime = currentTime + 86400000; // 设置目标时间为当前时间加一天
        localStorage.setItem('targetLoginTime', JSON.stringify(targetTime));
        setLoginTime(86400000); // 设置冷却时间为24小时
      } else {
        const targetTime = currentTime + 86400000; // 设置目标时间为当前时间加一天
        localStorage.setItem('targetPettionTime', JSON.stringify(targetTime));
        setPettionTime(86400000); // 设置冷却时间为24小时
      }
    } catch (error) {
      setOutput(`执行失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearTime = () => {
    setLoginTime(0);
    setPettionTime(0);
    // 清空 localStorage 中的目标时间
    localStorage.removeItem('targetLoginTime');
    localStorage.removeItem('targetPettionTime');
  };
  // 格式化时间为时分秒
  const formatTime = milliseconds => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}小时 ${minutes}分钟 ${seconds}秒`;
  };

  return (
    <InnerPageContainer title="All Acounts Balances Info">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin"></div>
          <p className="ml-2">loading...</p>
        </div>
      ) : (
        <>
          <PageMetaTags title="Balances" description={'balances page'} url="/balances" />
          <div className="overflow-x-auto">
            <button className="btn" onClick={() => Action('login')}>
              一键登录
            </button>
            <button className="btn" onClick={() => Action('pettion')}>
              一键请愿
            </button>
            <button className="btn " onClick={clearTime}>
              重置时间
            </button>
            <pre>{output}</pre>
            <span>登陆奖励剩余冷却时间：{formatTime(loginTime)}</span>
            <span className="ml-8">请愿奖励剩余冷却时间：{formatTime(pettionTime)}</span>
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>userAddress</th>
                  <th>TokensInfo</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((i, index) => (
                  <tr key={index}>
                    <th>{index + 1}</th>
                    <th
                      onClick={() => window.open(`https://www.ao.link/#/entity/${i.userAddress}`)}
                    >
                      {i.userAddress}
                    </th>
                    {i.tokensInfo.map((j, tokenIndex) => (
                      <th
                        key={tokenIndex}
                        onClick={() => window.open(`https://www.ao.link/#/token/${j.address}`)}
                      >
                        {(j.balances / 10 ** j.decimals).toFixed(j.decimals == 0 ? 0 : 5)}{' '}
                        {j.symbol}
                      </th>
                    ))}
                    <th>
                      <button className="btn" onClick={() => deleteAccount(i.userAddress)}>
                        delete
                      </button>
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </InnerPageContainer>
  );
}
