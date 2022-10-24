import chalk from 'chalk'
import { constants, utils } from 'ethers'

import { ContractValue, ProjectParameters } from '../types'

interface AddressDetails {
  name?: string
  address: string
  roles: Role[]
}

interface Role {
  name: string
  atName: string
  atAddress: string
}

export function invertAndPrint(project: ProjectParameters) {
  const addresses = new Map<string, AddressDetails>()

  function add(
    role: string,
    address: ContractValue,
    atName: string,
    atAddress: string,
  ) {
    if (
      typeof address !== 'string' ||
      !utils.isAddress(address) ||
      address === constants.AddressZero
    ) {
      return
    }
    let details = addresses.get(address)
    if (!details) {
      details = {
        name: project.contracts.find((x) => x.address === address)?.name,
        address,
        roles: [],
      }
      addresses.set(address, details)
    }
    details.roles.push({ name: role, atName, atAddress })
  }

  for (const contract of project.contracts) {
    for (const [key, value] of Object.entries(contract.values ?? {})) {
      if (Array.isArray(value)) {
        for (const [i, entry] of value.entries()) {
          add(`${key}[${i}]`, entry, contract.name, contract.address)
        }
      } else {
        add(key, value, contract.name, contract.address)
      }
    }
  }

  print(addresses)
}

function print(addresses: Map<string, AddressDetails>) {
  for (const details of addresses.values()) {
    const name = details.name
      ? chalk.blue(details.name)
      : chalk.yellow('Unknown')
    console.log(name, details.address)
    for (const role of details.roles) {
      console.log(
        '   ',
        chalk.red(role.name),
        'at',
        chalk.blue(role.atName),
        role.atAddress,
      )
    }
    console.log()
  }
}
