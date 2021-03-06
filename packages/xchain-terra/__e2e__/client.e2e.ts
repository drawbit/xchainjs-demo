import { Network, Tx } from '@xchainjs/xchain-client'
import { Chain, assetAmount, assetToBase, baseAmount, delay } from '@xchainjs/xchain-util'

/**
 * e2e test
 *
 * How to run?
 *
 * (1) Add `phrase` to `.env` file (see `.env.sample`)
 * (2) Run `yarn e2e` from `src/packages/xhain-client`
 *
 * Note: In case it fails to run all e2e at once, run it one by one by adding `only` to a test (@see https://jestjs.io/docs/setup-teardown#general-advice)
 *
 */

require('dotenv').config()

import { AssetLUNA, AssetUST, Client, TERRA_DECIMAL, getEstimatedFee } from '../src'

const phrase = process.env.PHRASE

describe('Client Test', () => {
  let terraClient: Client

  beforeEach(() => {
    terraClient = new Client({ phrase, network: Network.Testnet })
  })

  afterEach(async () => {
    await delay(200)
    terraClient.purgeClient()
  })

  it('should get LUNA transaction details', async () => {
    try {
      terraClient.setNetwork(Network.Testnet)

      const txHash = '5C2810ECB4C3F2A25FADD5A6806E7D5CFC37B59F4F72D69D8A25061E355437E0'
      const txDetails = await terraClient.getTransactionData(txHash)
      expect(txDetails.from[0].from).toEqual('terra1h6t6a8fkzcklgrdql4avpsyk7whak5umxmmek0')
      expect(txDetails.from[0].asset?.symbol).toEqual('LUNA')
      expect(txDetails.from[0].asset?.ticker).toEqual('LUNA')
      expect(txDetails.from[0].amount.amount().toFixed()).toEqual('100000')
      expect(txDetails.to[0].to).toEqual('terra13zeuy5c6hrcwv2u7a73jket2ujhf5e5us4m956')
      expect(txDetails.to[0].amount.amount().toFixed()).toEqual('100000')
      expect(txDetails.type).toEqual('transfer')
      expect(txDetails.hash).toEqual('5C2810ECB4C3F2A25FADD5A6806E7D5CFC37B59F4F72D69D8A25061E355437E0')
    } catch (error) {
      console.error(error)
      fail()
    }
  })
  it('should get KRW transaction details', async () => {
    try {
      terraClient.setNetwork(Network.Testnet)
      const txHash = 'A8057659C5F189B91E3D85794479D80A78B5A4F6D4C5E6CAC01A3FADB274332F'
      const txDetails = await terraClient.getTransactionData(txHash)
      console.log(JSON.stringify(txDetails))
      expect(txDetails.from[0].asset?.symbol).toEqual('KRW')
      expect(txDetails.from[0].asset?.ticker).toEqual('KRW')
      expect(txDetails.from[0].from).toEqual('terra1saynp5x60tr03sy4awr2rzt3wgmqrqahuahccv')
      expect(txDetails.from[0].amount.amount().toFixed()).toEqual('1000000')
      expect(txDetails.to[0].to).toEqual('terra1ltnkx0mv7lf2rca9f8w740ashu93ujughy4s7p')
      expect(txDetails.to[0].amount.amount().toFixed()).toEqual('1000000')
      expect(txDetails.type).toEqual('transfer')
      expect(txDetails.hash).toEqual('A8057659C5F189B91E3D85794479D80A78B5A4F6D4C5E6CAC01A3FADB274332F')
    } catch (error) {
      console.error(error)
      fail()
    }
  })
  it('should get address balances', async () => {
    try {
      terraClient.setNetwork(Network.Testnet)

      const address = 'terra1saynp5x60tr03sy4awr2rzt3wgmqrqahuahccv'
      const balances = await terraClient.getBalance(address)
      console.log(JSON.stringify(balances))
    } catch (error) {
      console.error(error)
      fail()
    }
  })
  it('should search for txs', async () => {
    try {
      terraClient.setNetwork('mainnet' as Network)

      const address = 'terra1sffpgwnyg69y93es86rdz8uvz4fdjtqcaxnjdp'
      const txs = await terraClient.getTransactions({ address })
      txs.txs.forEach((tx: Tx) => {
        console.log(JSON.stringify(tx, null, 2))
      })
    } catch (error) {
      console.error(error)
      fail()
    }
  })
  it('get fees - testnet', async () => {
    try {
      terraClient.setNetwork(Network.Testnet)

      const fees = await terraClient.getFees({
        sender: 'terra1saynp5x60tr03sy4awr2rzt3wgmqrqahuahccv',
        recipient: 'terra1saynp5x60tr03sy4awr2rzt3wgmqrqahuahccv',
        feeAsset: AssetLUNA,
        asset: AssetUST,
        amount: assetToBase(assetAmount(0.001)),
      })

      console.log(JSON.stringify(fees.fast.amount()))
    } catch (error) {
      console.error(error)
      fail()
    }
  })

  it('get fees w/ memo - testnet', async () => {
    try {
      terraClient.setNetwork(Network.Testnet)

      const fees = await terraClient.getFees({
        sender: 'terra1saynp5x60tr03sy4awr2rzt3wgmqrqahuahccv',
        recipient: 'terra1saynp5x60tr03sy4awr2rzt3wgmqrqahuahccv',
        feeAsset: AssetUST,
        asset: AssetUST,
        amount: assetToBase(assetAmount(0.01)),
        memo: '+:TERRA.UST',
      })

      console.log(JSON.stringify(fees))
    } catch (error) {
      console.error(error)
      fail()
    }
  })
  it('should get a msgMultiSend TX', async () => {
    try {
      terraClient.setNetwork(Network.Mainnet)

      const tx: Tx = await terraClient.getTransactionData(
        'C36E48ED757785BF0CF099C5B824B384B6C057D9FC4415E3EBDC02BA5496E65A',
      )
      expect(tx.asset.chain).toEqual(Chain.Terra)
      expect(tx.asset.ticker).toEqual('')
      expect(tx.asset.symbol).toEqual('')

      expect(tx.from.length).toEqual(5)
      expect(tx.to.length).toEqual(5)

      //Inputs
      expect(tx.from[0].from).toEqual('terra1fex9f78reuwhfsnc8sun6mz8rl9zwqh03fhwf3')
      expect(tx.from[0].asset?.symbol).toEqual('KRW')
      expect(tx.from[0].amount.amount().toFixed()).toEqual('1')
      expect(tx.from[1].from).toEqual('terra1l6834ha5h5l5dxkr0vl82hjcucfht3gpwlflq6')
      expect(tx.from[1].asset?.symbol).toEqual('KRW')
      expect(tx.from[1].amount.amount().toFixed()).toEqual('41948000000')
      expect(tx.from[2].from).toEqual('terra1fex9f78reuwhfsnc8sun6mz8rl9zwqh03fhwf3')
      expect(tx.from[2].asset?.symbol).toEqual('KRW')
      expect(tx.from[2].amount.amount().toFixed()).toEqual('3000000000')
      expect(tx.from[3].from).toEqual('terra1dtcvy52ma8gl5f2lx4klpqzcyfw90tujp66yp7')
      expect(tx.from[3].asset?.symbol).toEqual('KRW')
      expect(tx.from[3].amount.amount().toFixed()).toEqual('17000000000')
      expect(tx.from[4].from).toEqual('terra1fex9f78reuwhfsnc8sun6mz8rl9zwqh03fhwf3')
      expect(tx.from[4].asset?.symbol).toEqual('KRW')
      expect(tx.from[4].amount.amount().toFixed()).toEqual('25000000000')

      //outputs
      expect(tx.to[0].to).toEqual('terra1fex9f78reuwhfsnc8sun6mz8rl9zwqh03fhwf3')
      expect(tx.to[0].asset?.symbol).toEqual('KRW')
      expect(tx.to[0].amount.amount().toFixed()).toEqual('1')
      expect(tx.to[1].to).toEqual('terra1fd3yy3dlg6gm0fkapyqzcunl26zkwdnal0y2cq')
      expect(tx.to[1].asset?.symbol).toEqual('KRW')
      expect(tx.to[1].amount.amount().toFixed()).toEqual('41948000000')
      expect(tx.to[2].to).toEqual('terra1l6834ha5h5l5dxkr0vl82hjcucfht3gpwlflq6')
      expect(tx.to[2].asset?.symbol).toEqual('KRW')
      expect(tx.to[2].amount.amount().toFixed()).toEqual('3000000000')
      expect(tx.to[3].to).toEqual('terra1fd3yy3dlg6gm0fkapyqzcunl26zkwdnal0y2cq')
      expect(tx.to[3].asset?.symbol).toEqual('KRW')
      expect(tx.to[3].amount.amount().toFixed()).toEqual('17000000000')
      expect(tx.to[4].to).toEqual('terra1nqnmgh6vkrcq8e4sscjxwnyu740g5xuxlk9edr')
      expect(tx.to[4].asset?.symbol).toEqual('KRW')
      expect(tx.to[4].amount.amount().toFixed()).toEqual('25000000000')
    } catch (error) {
      console.error(error)
      fail()
    }
  })
  it('should get a msgSend TX, with multiple msgs', async () => {
    try {
      terraClient.setNetwork(Network.Testnet)

      const tx: Tx = await terraClient.getTransactionData(
        'A8057659C5F189B91E3D85794479D80A78B5A4F6D4C5E6CAC01A3FADB274332F',
      )
      expect(tx.asset.chain).toEqual(Chain.Terra)
      expect(tx.asset.ticker).toEqual('')
      expect(tx.asset.symbol).toEqual('')

      expect(tx.from.length).toEqual(2)
      expect(tx.to.length).toEqual(2)

      expect(tx.from[0].from).toEqual('terra1saynp5x60tr03sy4awr2rzt3wgmqrqahuahccv')
      expect(tx.from[0].asset?.symbol).toEqual('KRW')
      expect(tx.from[0].amount.amount().toFixed()).toEqual('1000000')
      expect(tx.to[0].to).toEqual('terra1ltnkx0mv7lf2rca9f8w740ashu93ujughy4s7p')
      expect(tx.to[0].asset?.symbol).toEqual('KRW')
      expect(tx.to[0].amount.amount().toFixed()).toEqual('1000000')

      expect(tx.from[1].from).toEqual('terra1saynp5x60tr03sy4awr2rzt3wgmqrqahuahccv')
      expect(tx.from[1].asset?.symbol).toEqual('KRW')
      expect(tx.from[1].amount.amount().toFixed()).toEqual('1000000')
      expect(tx.to[1].to).toEqual('terra1j6fey5tl70k9fvrv7mea7ahfr8u2yv7l23w5e6')
      expect(tx.to[1].asset?.symbol).toEqual('KRW')
      expect(tx.to[1].amount.amount().toFixed()).toEqual('1000000')
    } catch (error) {
      console.error(error)
      fail()
    }
  })

  it('transfers LUNA, w/ memo, fee LUNA by default', async () => {
    console.log('### transfer LUNA (fee: LUNA)')
    try {
      terraClient.setNetwork(Network.Testnet)
      console.log(terraClient.getAddress(0))
      console.log(terraClient.getAddress(1))
      const recipient = terraClient.getAddress(1)
      const txHash = await terraClient.transfer({
        walletIndex: 0,
        asset: AssetLUNA,
        amount: baseAmount(1, TERRA_DECIMAL),
        recipient,
        memo: 'fee-luna',
      })
      console.info('tx', terraClient.getExplorerTxUrl(txHash))
      expect(txHash).toBeDefined()
    } catch (error) {
      console.error(error)
      fail()
    }
    console.log('### END transfer LUNA (fee: LUNA)')
  })

  it('transfers LUNA, w/ memo, fee UST', async () => {
    console.log('### transfer LUNA (fee: UST)')
    try {
      terraClient.setNetwork(Network.Testnet)
      console.log(terraClient.getAddress(0))
      console.log(terraClient.getAddress(1))
      const recipient = terraClient.getAddress(1)
      const txHash = await terraClient.transfer({
        walletIndex: 0,
        asset: AssetLUNA,
        amount: baseAmount(1, TERRA_DECIMAL),
        recipient,
        memo: 'fee-luna',
        feeAsset: AssetUST,
      })
      console.info('tx', terraClient.getExplorerTxUrl(txHash))
      expect(txHash).toBeDefined()
    } catch (error) {
      console.error(error)
      fail()
    }
    console.log('### END transfer LUNA (fee: UST)')
  })

  it('transfers LUNA, w/ memo, estimated fee UST ', async () => {
    console.log('### transfer LUNA (estimated fee: UST)')
    try {
      const network = Network.Testnet
      terraClient.setNetwork(network)

      const asset = AssetLUNA
      const feeAsset = AssetUST
      const recipient = terraClient.getAddress(1)
      const memo = 'est-fee-ust'
      const amount = baseAmount(1, TERRA_DECIMAL)
      const { chainID, cosmosAPIURL } = terraClient.getConfig()
      const { amount: feeAmount, gasLimit } = await getEstimatedFee({
        chainId: chainID,
        cosmosAPIURL,
        sender: terraClient.getAddress(0),
        recipient,
        amount,
        asset,
        feeAsset,
        network,
      })
      const txHash = await terraClient.transfer({
        walletIndex: 0,
        asset,
        amount,
        recipient,
        memo,
        feeAsset,
        feeAmount,
        gasLimit,
      })
      console.info('tx', terraClient.getExplorerTxUrl(txHash))
      expect(txHash).toBeDefined()
    } catch (error) {
      console.error(error)
      fail()
    }
    console.log('### END transfer LUNA (estimated fee: UST)')
  })

  it('transfers UST, w/ memo , fee UST by default', async () => {
    console.log('### transfer UST (fee: UST)')
    try {
      terraClient.setNetwork(Network.Testnet)
      const recipient = terraClient.getAddress(1)
      const txHash = await terraClient.transfer({
        walletIndex: 0,
        asset: AssetUST,
        amount: assetToBase(assetAmount(0.01, TERRA_DECIMAL)), // 0.01 UST
        recipient,
        memo: 'fee-ust',
      })
      console.info('tx', terraClient.getExplorerTxUrl(txHash))
      expect(txHash).toBeDefined()
    } catch (error) {
      console.error(error)
      fail()
    }
    console.log('### END transfer UST (fee: UST)')
  })

  it('transfers UST, w/ memo, fee LUNA ', async () => {
    console.log('### transfer UST (fee: LUNA)')
    try {
      terraClient.setNetwork(Network.Testnet)
      const recipient = terraClient.getAddress(1)
      const txHash = await terraClient.transfer({
        walletIndex: 0,
        asset: AssetUST,
        amount: assetToBase(assetAmount(0.01, TERRA_DECIMAL)), // 0.01 UST
        recipient,
        memo: 'fee-luna',
        feeAsset: AssetLUNA,
      })
      console.info('tx', terraClient.getExplorerTxUrl(txHash))
      expect(txHash).toBeDefined()
    } catch (error) {
      console.error(error)
      fail()
    }
    console.log('### END transfer UST (fee: LUNA)')
  })

  it('transfers UST. w/ memo, estimated fee LUNA ', async () => {
    console.log('### transfer UST (estimated fee: LUNA)')
    try {
      const network = Network.Testnet
      terraClient.setNetwork(network)

      const asset = AssetUST
      const feeAsset = AssetUST
      const recipient = terraClient.getAddress(1)
      const memo = 'est-fee-luna'
      const amount = assetToBase(assetAmount(0.01, TERRA_DECIMAL))
      const { chainID, cosmosAPIURL } = terraClient.getConfig()
      const { amount: feeAmount, gasLimit } = await getEstimatedFee({
        chainId: chainID,
        cosmosAPIURL,
        sender: terraClient.getAddress(0),
        recipient,
        amount,
        asset,
        feeAsset,
        network,
      })
      const txHash = await terraClient.transfer({
        walletIndex: 0,
        asset,
        amount,
        recipient,
        memo,
        feeAsset,
        feeAmount,
        gasLimit,
      })
      console.info('tx', terraClient.getExplorerTxUrl(txHash))
      expect(txHash).toBeDefined()
    } catch (error) {
      console.error(error)
      fail()
    }
    console.log('### END transfer UST (estimated fee: LUNA)')
  })

  it('transfers EUT, fee EUT by default ', async () => {
    console.log('### transfer EUT (fee: EUT)')
    try {
      terraClient.setNetwork(Network.Testnet)
      const recipient = terraClient.getAddress(1)
      const txHash = await terraClient.transfer({
        walletIndex: 0,
        asset: { chain: Chain.Terra, symbol: 'EUT', ticker: 'EUT', synth: false },
        amount: assetToBase(assetAmount(0.01, TERRA_DECIMAL)), // 0.01 EUT
        recipient,
        memo: 'fee-luna',
      })
      console.info('tx', terraClient.getExplorerTxUrl(txHash))
      expect(txHash).toBeDefined()
    } catch (error) {
      console.error(error)
      fail()
    }
    console.log('### END transfer EUT (fee: EUT)')
  })

  it('transfers EUT, fee LUNA ', async () => {
    console.log('### transfer EUT (fee: LUNA)')
    try {
      terraClient.setNetwork(Network.Testnet)
      const recipient = terraClient.getAddress(1)
      const txHash = await terraClient.transfer({
        walletIndex: 0,
        asset: { chain: Chain.Terra, symbol: 'EUT', ticker: 'EUT', synth: false },
        amount: assetToBase(assetAmount(0.01, TERRA_DECIMAL)), // 0.01 EUT
        recipient,
        memo: 'fee-luna',
        feeAsset: AssetLUNA,
      })
      console.info('tx', terraClient.getExplorerTxUrl(txHash))
      expect(txHash).toBeDefined()
    } catch (error) {
      console.error(error)
      fail()
    }
    console.log('### END transfer EUT (fee: LUNA)')
  })

  it('transfers EUT, estimated fee LUNA ', async () => {
    console.log('### transfer EUT (estimated fee: LUNA)')
    try {
      const network = Network.Testnet
      terraClient.setNetwork(network)

      const asset = { chain: Chain.Terra, symbol: 'EUT', ticker: 'EUT', synth: false }
      const feeAsset = AssetLUNA
      const recipient = terraClient.getAddress(1)
      const memo = 'est-fee-luna'
      const amount = assetToBase(assetAmount(0.01, TERRA_DECIMAL))
      const { chainID, cosmosAPIURL } = terraClient.getConfig()
      const { amount: feeAmount, gasLimit } = await getEstimatedFee({
        chainId: chainID,
        cosmosAPIURL,
        sender: terraClient.getAddress(0),
        recipient,
        amount,
        asset,
        feeAsset,
        network,
      })
      const txHash = await terraClient.transfer({
        walletIndex: 0,
        asset,
        amount,
        recipient,
        memo,
        feeAsset,
        feeAmount,
        gasLimit,
      })
      console.info('tx', terraClient.getExplorerTxUrl(txHash))
      expect(txHash).toBeDefined()
    } catch (error) {
      console.error(error)
      fail()
    }
    console.log('### END transfer EUT (estimated fee: EUT)')
  })
})
