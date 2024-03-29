import { types, getRoot } from 'mobx-state-tree';

export const ContextModel = types.model("Context")
  .props({
    id: types.optional(types.identifier, 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx'),
    name: types.optional(types.string, '')
  })
  .actions(self => ({
    setName(value: string) {
      self.name = value;
    }
  }))
  .views(self => ({
    get deposits() {
      const root = getRoot(self);
      if(root && root.depositStore) {
        return root.depositStore.findByContext(self.id);
      } return [];
    }
  }));

type ContextType = typeof ContextModel.Type;
export interface Context extends ContextType {};

type ContextSnapshotType = typeof ContextModel.SnapshotType;
export interface ContextSnapshot extends ContextSnapshotType {};
