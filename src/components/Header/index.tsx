import { Trans } from '@lingui/macro'
import useScrollPosition from '@react-hook/window-scroll'
import { CHAIN_INFO } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useTheme from 'hooks/useTheme'
import { darken } from 'polished'
import { FiFilter, FiSearch } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'
import { Text } from 'rebass'
import { useShowClaimPopup, useToggleSelfClaimModal } from 'state/application/hooks'
import { useUserHasAvailableClaim } from 'state/claim/hooks'
import { useUserHasSubmittedClaim } from 'state/transactions/hooks'
import { useDarkModeManager } from 'state/user/hooks'
import { useNativeCurrencyBalances } from 'state/wallet/hooks'
import styled from 'styled-components/macro'

import { ReactComponent as Logo } from '../../assets/svg/Logo.svg'
import { ExternalLink, ThemedText } from '../../theme'
import ClaimModal from '../claim/ClaimModal'
import { CardNoise } from '../earn/styled'
import Menu from '../Menu'
import Row from '../Row'
import { Dots } from '../swap/styleds'
import Web3Status from '../Web3Status'
import HolidayOrnament from './HolidayOrnament'
import NetworkSelector from './NetworkSelector'

const HeaderFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 60px; /* Adjust height as needed */
  background-color: ${({ theme }) => theme.bg0}; /* Set background color */
  padding: 0 1rem; /* Adjust padding as needed */
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* Add box shadow if desired */

  ${({ theme }) => theme.mediaWidth.upToLarge`
    padding: 0 2rem; /* Adjust padding for larger screens */
  `};
`
const SearchBoxContainer = styled.div`
  position: relative;
  width: 30%;
  hieght: 80%;
  border: solid rgb(195, 197, 203);
  border-radius: 6px;
  height: 3rem; /* Equivalent to h-12 */
  background-color: #232634; /* Equivalent to bg-[#232634] */
  width: 35%; /* Equivalent to w-[35%] */
  border-radius: 0.5rem; /* Equivalent to rounded-2xl */
  border: 1px solid #313849; /* Equivalent to border border-[#313849] */
  display: flex; /* Equivalent to flex */
  align-items: center; /* Equivalent to items-center */
  padding: 1rem; /* Equivalent to p-4 */
`

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 10px; /* Adjust as needed */
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.text2}; /* Use theme color */
  cursor: pointer;
`

const FilterIcon = styled(FiFilter)`
  position: absolute;
  right: 10px; /* Adjust as needed */
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.text2}; /* Use theme color */
  cursor: pointer;
`

const SearchInput = styled.input`
  padding: 0.5rem 2rem; /* Add space for icons */
  border: none;
  border-radius: 4px;
  outline: none;
  font-weight: Bold;
  width: 100%;
  background-color: ${({ theme }) => theme.bg1}; /* Use theme background color */
  color: ${({ theme }) => theme.text1}; /* Use theme text color */
`
const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
`
const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
`

const StyledLogo = styled(Logo)`
  width: 50px; /* Adjust width as needed */
  hieght: 50px; /* Adjust width as needed */
  fill: ${({ theme }) => theme.text1}; /* Set fill color */
  z-index: 999;
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  &:not(:first-child) {
    margin-left: 0.5em;
  }

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: center;
  `};
`

const HeaderLinks = styled(Row)`
  justify-self: center;
  background-color: ${({ theme }) => theme.bg0};
  width: fit-content;
  padding: 2px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  overflow: auto;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    justify-self: start;  
    `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: center;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    z-index: 99;
    position: fixed;
    bottom: 0; right: 50%;
    transform: translate(50%,-50%);
    margin: 0 auto;
    background-color: ${({ theme }) => theme.bg0};
    border: 1px solid ${({ theme }) => theme.bg2};
    box-shadow: 0px 6px 10px rgb(0 0 0 / 2%);
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg0 : theme.bg0)};
  border-radius: 16px;
  white-space: nowrap;
  width: 100%;
  height: 40px;

  :focus {
    border: 1px solid blue;
  }
`

const UNIAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
`

const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }

  position: relative;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  font-weight: 500;
  padding: 8px 12px;
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap;
  &.${activeClassName} {
    border-radius: 14px;
    font-weight: 600;
    justify-content: center;
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const StyledExternalLink = styled(ExternalLink).attrs({
  activeClassName,
})<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
    text-decoration: none;
  }
`

export default function Header() {
  const { account, chainId } = useActiveWeb3React()

  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[account ?? '']
  const [darkMode] = useDarkModeManager()
  const { white, black } = useTheme()

  const toggleClaimModal = useToggleSelfClaimModal()

  const availableClaim: boolean = useUserHasAvailableClaim(account)

  const { claimTxn } = useUserHasSubmittedClaim(account ?? undefined)

  const showClaimPopup = useShowClaimPopup()

  const scrollY = useScrollPosition()

  const {
    infoLink,
    nativeCurrency: { symbol: nativeCurrencySymbol },
  } = CHAIN_INFO[chainId ? chainId : SupportedChainId.MAINNET]

  return (
    <HeaderFrame>
      <ClaimModal />
      <Title href=".">
        <LogoWrapper>
          <StyledLogo />
          <HolidayOrnament />
        </LogoWrapper>
      </Title>
      <HeaderLinks>
        <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
          <Trans>Swap</Trans>
        </StyledNavLink>
        <StyledNavLink
          id={`pool-nav-link`}
          to={'/pool'}
          isActive={(match, { pathname }) =>
            Boolean(match) ||
            pathname.startsWith('/add') ||
            pathname.startsWith('/remove') ||
            pathname.startsWith('/increase') ||
            pathname.startsWith('/find')
          }
        >
          <Trans>Pool</Trans>
        </StyledNavLink>
        {(!chainId || chainId === SupportedChainId.MAINNET) && (
          <StyledNavLink id={`vote-nav-link`} to={'/vote'}>
            <Trans>Vote</Trans>
          </StyledNavLink>
        )}
        <StyledExternalLink id={`charts-nav-link`} href={infoLink}>
          <Trans>Charts</Trans>
          <sup>↗</sup>
        </StyledExternalLink>
      </HeaderLinks>
      <SearchBoxContainer>
        <SearchIcon />
        <SearchInput type="text" placeholder="Search tokens for NFT Collections" />
        <FilterIcon />
      </SearchBoxContainer>
      <HeaderControls>
        <HeaderElement>
          <NetworkSelector />
        </HeaderElement>
        <HeaderElement>
          {availableClaim && !showClaimPopup && (
            <UNIWrapper onClick={toggleClaimModal}>
              <UNIAmount active={!!account && !availableClaim} style={{ pointerEvents: 'auto' }}>
                <ThemedText.White padding="0 2px">
                  {claimTxn && !claimTxn?.receipt ? (
                    <Dots>
                      <Trans>Claiming UNI</Trans>
                    </Dots>
                  ) : (
                    <Trans>Claim UNI</Trans>
                  )}
                </ThemedText.White>
              </UNIAmount>
              <CardNoise />
            </UNIWrapper>
          )}
          <AccountElement active={!!account}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0, userSelect: 'none' }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                <Trans>
                  {userEthBalance?.toSignificant(3)} {nativeCurrencySymbol}
                </Trans>
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElement>
          <Menu />
        </HeaderElement>
      </HeaderControls>
    </HeaderFrame>
  )
}
