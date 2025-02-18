import { navigate, useLocation } from '@reach/router';
import { Account } from 'api/apollo/generated/graphql';
import Avatar from 'components/Avatar';
import Button from 'components/Button';
import ExplorerPlusIcon from 'components/Icons/ExplorerPlusIcon';
import { EntityType } from 'providers/Project';
import { useProject } from 'providers/Project/projectHooks';
import React, { useState } from 'react';
import { SXStyles } from 'src/types';
import { Box, Flex } from 'theme-ui';
import { getParams, isUUUID, LOCAL_PROJECT_ID } from '../../../util/url';

type AccountListProps = {
  isExplorerCollapsed: boolean;
};

const styles: SXStyles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'IBM Plex Mono',
  },
  hiddenRoot: {
    visibility: 'hidden',
  },
  header: {
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: '14px',
    letterSpacing: '-0.01em',
    textTransform: 'uppercase',
    color: '#69717E',
    justifyContent: 'space-between',
  },
  headerTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'Acumin Pro',
  },
  button: {
    padding: '0px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'start',
    padding: '0.2rem 0.5rem',
    '&:hover': {
      background: '#DEE2E9',
      borderRadius: '8px',
      cursor: 'pointer',
    },
  },
  selectedItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'start',
    background: '#EAEAFA',
    borderRadius: '8px',
    padding: '0.2rem 0.5rem',
  },
  accountCard: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    width: '100%',
  },
  accountTitle: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '3px',
  },
  avatar: {
    marginRight: '1rem',
    width: '35px',
    height: '35px',
    borderRadius: '0 0 20px 20px',
  },
};

function getDeployedContracts(account: Account): string {
  const contractCount = account.deployedContracts.length;
  if (contractCount > 1) {
    return contractCount + ' Contracts';
  } else if (contractCount > 0) {
    const singleContract = account.deployedContracts[0];
    const contractName = singleContract.split('.')[0];
    return contractName;
  } else {
    return '';
  }
}

const AccountList = ({ isExplorerCollapsed }: AccountListProps) => {
  const { project, active, setSelectedResourceAccount } = useProject();
  const accountSelected = active.type === EntityType.AccountStorage;
  const location = useLocation();
  const params = getParams(location.search);
  const projectPath = isUUUID(project.id) ? project.id : LOCAL_PROJECT_ID;
  const [isInserting, setIsInserting] = useState(false);

  return (
    <Flex sx={isExplorerCollapsed ? styles.hiddenRoot : styles.root}>
      <Flex sx={styles.header}>
        <Flex sx={styles.headerTitle}>Accounts</Flex>
        <Button
          sx={styles.button}
          inline={true}
          disabled={isInserting}
          variant="explorer"
          onClick={async () => {
            setIsInserting(true);
            try {
              // insert account
            } catch {
              setIsInserting(false);
            }
            setIsInserting(false);
          }}
        >
          <ExplorerPlusIcon />
        </Button>
      </Flex>
      <Box data-test="account-list">
        {project.accounts.map((account: Account, i: number) => {
          const rawAddress = account.address.slice(-2);
          const accountAddress = `0x${rawAddress}`;
          const finalAddress =
            accountAddress == '0x01'
              ? `${accountAddress}-Default`
              : `${accountAddress}`;
          const contractName = getDeployedContracts(account);
          const title = contractName
            ? `${contractName} deployed to this account`
            : `This account don't have any contracts`;

          const isActive = accountSelected && accountAddress == params.storage;
          let queryParams =
            params.storage === accountAddress
              ? `?type=account&storage=none`
              : `?type=account&storage=${accountAddress}`;

          return (
            <Flex
              sx={isActive ? styles.selectedItem : styles.item}
              title={title}
              key={account.address}
            >
              <Flex
                sx={styles.accountCard}
                onClick={() => {
                  if (accountAddress !== params.storage) {
                    setSelectedResourceAccount(accountAddress);
                    navigate(`/${projectPath}${queryParams}`);
                  }
                }}
              >
                <Avatar style={styles.avatar} seed={project.seed} index={i} />
                <Flex sx={styles.accountTitle}>
                  <strong>{finalAddress}</strong>
                  <small>{contractName || '--'}</small>
                </Flex>
              </Flex>
            </Flex>
          );
        })}
      </Box>
    </Flex>
  );
};

export default AccountList;
