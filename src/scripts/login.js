const { message, createDataItemSigner, result, spawn, dryrun } = require('@permaweb/aoconnect');

const llamaCoin = 'pazXumQI-HPH7iFGfTC-4_7biSnqz_U67oFAGry5zUY';
const llamaWaitList = '2dFSGGlc5xJb0sWinAnEFHM-62tQEbhDzi1v5ldWX5k';
const llamaKing = 'ptvbacSmqJPfgCXxPc9bcobs5Th2B_SxTf81vRNkRzk'; // llama King

export const login = async key => {
  try {
    await message({
      process: llamaWaitList,
      tags: [{ name: 'Action', value: 'Tracking-Login' }],
      signer: createDataItemSigner(key),
    });
  } catch (error) {
    console.log('error', error);
  }
  return 'success!';
};

export const pettion = async (key, name) => {
  for (let i = 0; i < 3; i++) {
    const msgId = await message({
      process: llamaCoin,
      tags: [
        { name: 'Action', value: 'Transfer' },
        { name: 'Quantity', value: '1000000000000' },
        { name: 'Recipient', value: llamaKing },
        {
          name: 'X-Petition',
          value:
            '"Dragon Ball Z" - Goku and his friends battle powerful enemies and seek out the seven Dragon Balls to grant their wishes. This anime is known for its epic battles, memorable characters, and inspiring story of friendship and growth.',
        },
        { name: 'X-Sender-Name', value: name },
      ],
      signer: createDataItemSigner(key),
    });
  }
  return 'success!';
};
