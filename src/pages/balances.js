import InnerPageContainer from '@/components/common/InnerPageContainer';
import PricingPlans from '@/components/common/PricingPlans';
import PageMetaTags from '@/containers/PageMetaTags';
import { useEffect, useState } from 'react';
import { message, createDataItemSigner, result, spawn, dryrun } from '@permaweb/aoconnect';
import { TokenAddress } from '@/config/Address';

export default function Page() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true); // 初始状态设为加载中

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const accounts = JSON.parse(localStorage.getItem('accountsInfo')) || [];
    const data = await Promise.all(
      accounts.map(async account => {
        const infos = await getBalances(account.address);
        return { userAddress: account.address, tokensInfo: infos };
      })
    );
    console.log('data', data);
    setTableData(data);
    setLoading(false);
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

  return (
    <InnerPageContainer title="All Acounts Balances Info">
      <PageMetaTags title="Balances" description={'balances page'} url="/balances" />
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>userAddress</th>
              <th>TokensInfo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2">loading...</td>
              </tr>
            ) : (
              tableData.map((i, index) => (
                <tr key={index}>
                  <th>{index + 1}</th>
                  <th onClick={() => window.open(`https://www.ao.link/#/entity/${i.userAddress}`)}>
                    {i.userAddress}
                  </th>
                  {i.tokensInfo.map((j, tokenIndex) => (
                    <th
                      key={tokenIndex}
                      onClick={() => window.open(`https://www.ao.link/#/token/${j.address}`)}
                    >
                      {(j.balances / 10 ** j.decimals).toFixed(j.decimals == 0 ? 0 : 5)} {j.symbol}
                    </th>
                  ))}
                  <th>
                    <button className="btn" onClick={() => deleteAccount(i.userAddress)}>
                      delete
                    </button>
                  </th>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </InnerPageContainer>
  );
}
