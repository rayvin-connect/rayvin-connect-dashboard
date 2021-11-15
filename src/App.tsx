import React, { useEffect, useState } from 'react'
import './App.css'
import { RayvinClient, RayvinFeed } from 'rayvin-connect'
import { MomentListedData } from 'rayvin-connect/lib/lib/feed/messages/moment-listed-message'
import moment from 'moment';
import { momentUrl } from 'rayvin-connect/lib/lib/helpers/top-shot-helpers'

function App () {
  const [apiKey, setApiKey] = useState(undefined as string | undefined)
  const [pingTime, setPingTime] = useState(undefined as number | undefined)
  const [listings, setListings] = useState([] as MomentListedData[])
  const [status, setStatus] = useState('Disconnected')
  const [error, setError] = useState(undefined as string | undefined)

  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (apiKey) {
      const feed = new RayvinFeed(new RayvinClient(apiKey))

      feed.on('pong', ev => {
        setPingTime(ev.pingTime)
      })

      feed.on('error', ev => {
        setError(ev.error)
      })

      feed.on('connected', () => {
        setStatus('Connected')
        setError(undefined)
      })

      feed.on('disconnected', () => {
        setStatus('Disconnected')
      })

      feed.on('moment-listed', ev => {
        setListings(listings => [
          ev,
          ...listings.slice(0, 50),
        ])
      })

      feed.on('moment-purchased', ev => {
        setListings(listings => listings.filter(l => l.moment.flowId !== ev.moment.flowId))
      })

      feed.on('moment-withdrawn', ev => {
        setListings(listings => listings.filter(l => l.moment.flowId !== ev.moment.flowId))
      })

      feed.connect().then()

      return () => {
        feed.disconnect()
      }
    }
  }, [setListings, setError, setStatus, setPingTime, apiKey])

  const updateApiKey = () => {
    if (inputValue.trim().length) {
      setApiKey(inputValue.trim())
    }
  }

  return (
    <div className="App">
      <div style={{ margin: 20, display: 'flex' }}>
        <div style={{ flex: 1 }}>
          Enter your Rayvin Connect API Key:
          <input type={'text'} value={inputValue} onChange={ev => setInputValue(ev.target.value)}/>
          <button type={'button'} onClick={updateApiKey}>Go</button>
        </div>
        {
          apiKey
            ? <div style={{ marginLeft: 20 }}>
              Using API Key: {apiKey}
            </div>
            : null
        }
      </div>
      {
        apiKey
          ? <>
            <div style={{ display: 'flex', flexDirection: 'row', margin: 20 }}>
              <div style={{ flex: 1 }}>
                Status: {status}
              </div>
              <div>
                Ping: {pingTime ? `${pingTime}ms` : 'N/A'}
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                {
                  error
                    ? `Error: ${error}`
                    : null
                }
              </div>
            </div>
            <table style={{ width: '100%', borderSpacing: 0, margin: 20 }}>
              <thead>
              <tr>
                <th style={{ padding: 2, textAlign: 'left' }}>Date</th>
                <th style={{ padding: 2, textAlign: 'left' }}>Player</th>
                <th style={{ padding: 2, textAlign: 'left' }}>Play Category</th>
                <th style={{ padding: 2, textAlign: 'left' }}>Serial</th>
                <th style={{ padding: 2, textAlign: 'right' }}>Price</th>
                <th style={{ padding: 2, textAlign: 'left' }}>Seller</th>
                <th/>
              </tr>
              </thead>
              <tbody>
              {listings.map((listing, idx) => <tr style={{ backgroundColor: (idx % 2) === 0 ? '#eee' : '#fff' }} key={listing.moment.flowId}>
                <td style={{ padding: 2 }}>{moment.unix(listing.timestamp).format('MM/DD/YYYY HH:mm:ss')}</td>
                <td style={{ padding: 2 }}>{listing.play.playerName}</td>
                <td style={{ padding: 2 }}>{listing.play.playCategory}</td>
                <td style={{ padding: 2 }}>{listing.moment.serialNumber}</td>
                <td style={{ padding: 2, textAlign: 'right' }}>${listing.listing.price}</td>
                <td style={{ padding: 2 }}>{listing.listing.seller.topShotUsername ?? listing.listing.seller.flowAddress}</td>
                <td style={{ padding: 2 }}><a target={'_blank'} rel={'noreferrer'} href={momentUrl(listing.moment.externalId)}>BUY</a></td>
              </tr>)}
              </tbody>
            </table>
          </>
          : <div style={{ margin: 20 }}>
            <p>If you do not have a Rayvin Connect API Key, visit <a target={'_blank'} rel={'noreferrer'} href={'https://rayvin.io/'}>https://rayvin.io/</a> and log in. Check out the "Rayvin Connect" page from the main header navigation.</p>
          </div>
      }

    </div>
  );
}

export default App
