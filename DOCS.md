# Leaderboard

The [Neverland Leaderboard](https://app.neverland.money/leaderboard) is an incentive system that rewards productive protocol participation over time. Participation is automatic for all users interacting with the protocol. There is no opt-in, entry fee, or guaranteed payout.

Rewards are distributed probabilistically at the end of each cycle, weighted by participation.

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FMMwTQaGJItr4PMe37lbl%2Fimage.png?alt=media&#x26;token=3fa541c5-8e39-4473-906f-d76baf511c5a" alt="" data-size="line"> Tides

Leaderboard cycles are called **Tides**. Each Tide begins on a **full moon** and ends at the next full moon. Tides run on an approximately monthly cadence. Pearl balances reset at the start of each Tide. Pearls only accrue during the active Tide.

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FCEU6M9G2awWuC6g3pKEf%2Fimage.png?alt=media&#x26;token=5ed4bf25-04be-4209-b9b3-c299a9b32b5d" alt="" data-size="line"> Pearls

**Pearls** are a non-transferable accounting unit derived from on-chain activity. They are not tokens and do not represent ownership or guaranteed rewards.

Pearls are used to rank users within a Tide, and for weight probability during reward selection. They have no standalone value outside of the leaderboard system.

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FVL9HnKS2XsegxarJCv6r%2Fimage.png?alt=media&#x26;token=f4023b60-7d0f-4648-8f80-d653aefb69cf" alt="" data-size="line"> Pearl Accrual

Pearls accrue daily based on protocol usage:

{% columns %}
{% column width="33.33333333333333%" %} <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> **Supplying assets**

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> **Borrowing assets**

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> **veDUST power**

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> **DUST LP**
{% endcolumn %}

{% column width="66.66666666666667%" %}
`0.02 Pearls per $1 supplied / day`&#x20;

`0.05 Pearls per $1 borrowed / day`

`0.25 Pearls per 1 veDUST power / day`

`0.25 Pearls per $1 LP value in range / day` &#x20;
{% endcolumn %}
{% endcolumns %}

> Example: If you supply $1,000 for a full day: `0.02 × 1,000 × 1 day = 20 Pearls`

{% hint style="warning" %}
Accrual resets when the Tide ends.
{% endhint %}

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FVL9HnKS2XsegxarJCv6r%2Fimage.png?alt=media&#x26;token=f4023b60-7d0f-4648-8f80-d653aefb69cf" alt="" data-size="line"> Pearl Settlement Timing

Pearls are **not updated instantly per transaction**.

User actions on the lending system, veDUST, and liquidity pools settle different components of Pearl accrual. The Leaderboard Keeper also periodically settles all positions (typically once per day), ensuring fair point accrual even when users are not actively interacting with Neverland.

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Displayed Pearl balances reflect the **latest settlement**\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> All elapsed time is captured\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> **No Pearls are lost** between settlements

{% hint style="success" %}
Settlement timing affects **display**, not accrual.
{% endhint %}

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FVL9HnKS2XsegxarJCv6r%2Fimage.png?alt=media&#x26;token=f4023b60-7d0f-4648-8f80-d653aefb69cf" alt="" data-size="line"> Multipliers

All bonuses are additive and then capped at a **10x total multiplier**.\
If additional multipliers or partnerships are introduced in the future, they will stack additively and remain subject to the same **10x total cap**.

```
Total Multiplier =
min(
  1x (Base)
  + NFT Boost
  + veDUST Boost (not currently present)
  + Testnet Bonus,
  10x
)
```

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FVL9HnKS2XsegxarJCv6r%2Fimage.png?alt=media&#x26;token=f4023b60-7d0f-4648-8f80-d653aefb69cf" alt="" data-size="line"> NFT Partnership Boosts

**Active Partnerships**

Some users receive Pearl multipliers applied to accrual. **Testnet participants** will receive a multiplier during the first Tide, and our **Partner NFT holders** receive an ongoing multiplier while the NFT is held. Multipliers apply automatically and may change over time.

Current partnership boosts include: [**The** **10k Squad**](https://x.com/the10kSquad)**,** [**Fluffle**](https://x.com/fluffleworld)**,** [**Overnads**](https://x.com/overnads)

<table><thead><tr><th width="173">Project</th><th width="390">Collection Address</th><th>Boost Structure</th></tr></thead><tbody><tr><td>The 10k Squad</td><td><code>0x818030837e8350ba63e64d7dc01a547fa73c8279</code></td><td>Flat 20%</td></tr><tr><td>Fluffle World</td><td><code>0x8255DACD8A45f4aBE6dc821E6f7F3c92a8E22fBB</code></td><td>10% → 9% → 8.1%</td></tr><tr><td>Overnads</td><td><code>0xFb5BA4061f5c50b1DAA6C067Bb2dFB0A8EbF6a8D</code></td><td>10% → 9% → 8.1%</td></tr></tbody></table>

**Rules**

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> A Multiplier applies **as long as the NFT is held**\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Boosts apply to **all Pearl sources** (Supply, Borrow, veDUST, LP)\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> **Buys, sales, or transfers** of the NFT update your multiplier at the **next settlement**\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Holding more than one NFT from the same collection provides **no additional benefit**

This ensures fair distribution while preventing multiplier inflation through NFT concentration.

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FVL9HnKS2XsegxarJCv6r%2Fimage.png?alt=media&#x26;token=f4023b60-7d0f-4648-8f80-d653aefb69cf" alt="" data-size="line"> LP Position Requirements

#### Eligible Pool

* Pair: **AUSD / DUST**
* Fee Tier: **1%**
* Pool Address: `0xd15965968fe8bf2babbe39b2fc5de1ab6749141f`

#### In-Range Requirement

LP Pearls accrue **only while your position is in-range**.

* Out of range → accrual pauses
* Back in range → accrual resumes
* Only **in-range time** counts

#### Rate

```
0.25 Pearls per $1 per day (in-range only)
```

> Example: $5,000 LP in-range for 12 hours (0.5 day) = `0.25 × 5,000 × 0.5 = 625 Pearls`

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2Frfr62Js9bPqRXzZXS9UI%2Fimage.png?alt=media&#x26;token=e7c85fb6-cca0-4792-afae-5b013cf58d2c" alt="" data-size="line"> Reward Selection Mechanics

At the end of each Tide, **100 winners** are selected using a **bucketed, weighted random process**.

For each rank bracket, winners are selected by running a **weighted random draw once per winner slot**. If a bracket has *Y* winners, the process runs *Y* draws, and each selected wallet is removed from the bracket before the next draw. In each draw, a user’s probability is proportional **to their Pearls relative to the total Pearls remaining** in that bracket, meaning probabilities apply per draw and higher Pearl balances increase expected outcomes without guaranteeing selection.

Bracket Distribution:

{% columns %}
{% column width="25%" %} <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> 1–100

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> 101–200

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> 201–300

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> 301+
{% endcolumn %}

{% column width="75%" %}
**50** winners

**25** winners

**15** winners

**10** winners
{% endcolumn %}
{% endcolumns %}

Only users with non-zero Pearls are eligible. Within each bracket, selection is random and weighted by Pearl balance. Higher participation increases odds but does not guarantee selection.

#### Selection Method

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Weighted random per bracket\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Probability per draw:

```
Your Pearls ÷ Total Bracket Pearls
```

#### Example (Ranks 101–200)

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Your Pearls: 5,000\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Bracket Total: 100,000

```
Chance per draw ≈ 5%
Expected wins ≈ 1.25
```

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FqueyyKnu5D0UfsZgSfmI%2Fimage.png?alt=media&#x26;token=6c50dc2f-df81-4f5d-b6df-bbb880c0c8cd" alt="" data-size="line"> Blacklist & Eligibility

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Governance can blacklist addresses\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Blacklisted wallets do not appear on leaderboards\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Blacklisting is reversible\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Status is verifiable via `LeaderboardConfig`

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FqueyyKnu5D0UfsZgSfmI%2Fimage.png?alt=media&#x26;token=6c50dc2f-df81-4f5d-b6df-bbb880c0c8cd" alt="" data-size="line">Point Precision & Display

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> UI shows human-readable values (e.g. `1,234.5`)\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Internally stored with **18 decimal precision**

Example:

```
1,234 Pearls
= 1234567890123456789012 (raw)
```

This prevents rounding drift and preserves exactness.

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FqueyyKnu5D0UfsZgSfmI%2Fimage.png?alt=media&#x26;token=6c50dc2f-df81-4f5d-b6df-bbb880c0c8cd" alt="" data-size="line">Verification & Smart Contracts

Nothing here is abstract, discretionary, or opaque. Everything ties back to on-chain data.

#### Core Contracts

`EpochManager` handles all epoch lifecycle management, scheduling start and end times for each Tide. `LeaderboardConfig` manages Pearl accrual rates (deposit, borrow, veDUST, LP), LP pool eligibility, blacklist, and manual point adjustments. `VotingPowerMultiplier` defines veDUST tier multipliers based on voting power thresholds (currently unused). `NFTPartnershipRegistry` stores NFT partnership configurations and their boost multipliers. `LeaderboardKeeper` settles users on-demand, syncing their voting power, NFT holdings, and LP positions, ensuring points accrue fairly for everyone, even when they're not actively interacting with Neverland.

#### How to Verify

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Pearl accrual derives from on-chain events\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Rate changes emit events with timestamps\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Position balances match lending pool state\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Multiplier changes are logged (NFT, veDUST)

<table><thead><tr><th width="270">Contract</th><th>Address</th></tr></thead><tbody><tr><td>EpochManager</td><td><code>0xdA27A7745CBE958B0d00268cf63394A0d09c0216</code></td></tr><tr><td>LeaderboardConfig</td><td><code>0xDff18C7a928544449eF2Bb84c609f95427d7fcc8</code></td></tr><tr><td>LeaderboardKeeper</td><td><code>0x550eAaD1Ddc5Fd13Bc9818D99f985E7367D5D2B9</code></td></tr><tr><td>NFTPartnershipRegistry</td><td><code>0xAB71Ce6910F255CC61fAf78EBd69A2B3dbC26Cd9</code></td></tr><tr><td>VotingPowerMultiplier</td><td><code>0x9b203C61d03e64550BFbC17EF56438D1a67D80b7</code></td></tr></tbody></table>

#### Indexer

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Processes raw on-chain events\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Public source code\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Anyone can re-run it\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Leaderboard output matches chain state exactly

{% hint style="info" %}
The leaderboard indexer is **publicly accessible** under the Neverland GitHub organization [here](https://github.com/Neverland-Money/neverland-hyperindex).

Documentation is provided to allow anyone to **run the indexer locally** and independently validate leaderboard data against on-chain events.
{% endhint %}

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FqueyyKnu5D0UfsZgSfmI%2Fimage.png?alt=media&#x26;token=6c50dc2f-df81-4f5d-b6df-bbb880c0c8cd" alt="" data-size="line"> What’s Not Included

Currently disabled (may activate in future Tides):

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> veDUST holding tier multipliers\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Daily activity bonuses\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Referral bonuses\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Streak bonuses

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FqueyyKnu5D0UfsZgSfmI%2Fimage.png?alt=media&#x26;token=6c50dc2f-df81-4f5d-b6df-bbb880c0c8cd" alt="" data-size="line"> Fair Play & Anti-Gaming

#### Sybil Resistance

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Multiple wallets allowed\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Rewards are probabilistic\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> NFT and testnet bonuses are wallet-bound

{% hint style="danger" %}
Splitting activity across multiple wallets does **not** increase overall winning odds, as it simply divides your Pearls and therefore splits your probability of selection.
{% endhint %}

#### Flash Loan Protection

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Time-weighted accrual\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Same-block borrow/repay earns negligible Pearls\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Sustained positions matter

#### Design Intent

<img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Higher Pearls improve odds\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> No rank guarantees rewards\ <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FpjZ58NDZydw5ocWhyCKD%2Fimage.png?alt=media&#x26;token=79215ef5-05c7-412a-83e2-07dad529cf07" alt="" data-size="line"> Built for healthy usage habits

### <img src="https://3611561064-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FWsM8j790KEBUuc1aV7HE%2Fuploads%2FyBhJOQgdgth5cd8SyH01%2Fimage.png?alt=media&#x26;token=7e5abc18-8882-4eea-afd7-45993c75e90d" alt="" data-size="line">  Important Notes

Rewards are **not guaranteed.** Results are **not retroactive.** Ranking does **not** entitle users to rewards. Outcomes vary by Tide. The system is fair in **process**, not in individual outcomes.

Pearls are calculated mechanically from your **on-chain behavior** using published rates. Rewards are random but weighted. There are **no discretionary levers**, **no off-chain favoritism**, and **no invisible boosts**.
