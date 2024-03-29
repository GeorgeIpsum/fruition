import { types, getEnv, getRoot } from 'mobx-state-tree';
import { DepositModel, Deposit, DepositSnapshot, DepositStatus } from '.';
//import { RootStore } from '../root-store';
import { Environment } from '../environment';
import { flow } from 'mobx';
import { UUIDGenerator, compare } from '../../utilities/helpers';
import { LoadingStatus } from '../status';

export const DepositListStoreModel = types.model("DepositListStore")
  .props({
    status: types.optional(types.enumeration<LoadingStatus>("DepositListLoadingStatus", Object.values(LoadingStatus)), LoadingStatus.idle),
    deposits: types.optional(types.array(DepositModel), []),
    currentlyTyping: types.optional(types.string, '')
  })
  .actions(self => ({
    setStatus(value: LoadingStatus) {
      self.status = value;
    },
    setDeposits(value: Deposit[] | DepositSnapshot[] | null) {
      if(self.deposits) {
        if(value) {
          self.deposits.replace(value as any);
        } else {
          self.deposits.clear();
        }
      } else {
        self.deposits = value as any;
      }
    },
    setCurrentlyTyping(value: string) {
      self.currentlyTyping = value;
    },
    addDeposit({value, status, context, project} = {value: '', status: DepositStatus.unprocessed, context: '', project: ''}): boolean {
      if(self.deposits) {
        const deposit = {
          id: UUIDGenerator(),
          contextId: context,
          projectId: project,
          value: value,
          status: status,
          positionInProject: null
        };

        if(project && project!=='') {
          const root = getRoot(self);
          if(root && root.projectStore) {
            const projectObj = root.projectStore.findById(project);
            if(projectObj) {
              deposit.positionInProject = projectObj.deposits.length;
            }
          }
        }

        const added: Deposit = DepositModel.create(deposit);
        const deposits = [...self.deposits, ...[added]];
        self.deposits.replace(deposits as any);
        return true;
      } return false;
    },
    changeDeposit(index, {value, status}) {
      if(self.deposits && self.deposits[index]) {
        if(value && value!=='') {
          self.deposits[index].setValue(value);
          return true;
        }
        if(status && status!=='') {
          self.deposits[index].setStatus(status);
          return true;
        } return false;
      } return false;
    }
  }))
  .views(self => ({
    get environment() {
      return getEnv(self) as Environment;
    },
    get rootStore() {
      return getRoot(self) as any; //returning this as RootStore results in ts calling a circular reference
    },
    get isLoading() {
      return self.status === "pending";
    },
    get items() {
      return self.deposits;
    },
    get chronological() {
      return self.deposits.slice().sort((d1, d2) => {
        return compare(d1.dateAdded.getTime(), d2.dateAdded.getTime());
      });
    }
  }))
  .actions(self => ({
    loadDeposits: flow(function*() {
      self.setStatus(LoadingStatus.pending);
      try { 
        const result = yield self.environment.depositApi.getDeposits();

        //@ts-ignore
        if(result.kind === "ok") {
          //@ts-ignore
          self.setDeposits(result.deposits);
          self.setStatus(LoadingStatus.done);
        } else {
          self.setStatus(LoadingStatus.error);
        }
      } catch {
        self.setStatus(LoadingStatus.error);
      }
    }),
  }))
  .views(self => ({
    chronoView(deposits?: any) {
      if(deposits) {
        return deposits.slice().sort((d1, d2) => {
          return compare(d1.dateAdded.getTime(), d2.dateAdded.getTime());
        });
      } else {
        return self.chronological;
      }
    },
    findById(id: string) {
      if(self.deposits) {
        const value = self.deposits.find((d) => d.id === id);
        if(value) {
          return value;
        } return false;
      } return false;
    },
    findByContext(contextID: string) {
      return self.deposits.filter((deposit) => deposit.contextId === contextID);
    },
    findByProject(projectID: string) {
      return self.deposits.filter((deposit) => deposit.projectId === projectID);
    }
  }));

type DepositStoreType = typeof DepositListStoreModel.Type;
export interface DepositStore extends DepositStoreType {};
