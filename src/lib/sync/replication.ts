import type { MyDatabase } from '$lib/store';
import * as bt from '$lib/bluetooth';
import type { RxReplicationState } from 'rxdb/dist/types/types';

export const doReplication = async (
	db: MyDatabase,
	macAddress: string,
	collection: string,
	live = false
): Promise<RxReplicationState<any>> => {
	// Use dynamic import to solve "Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import"
	const { replicateRxCollection } = await import('rxdb/src/plugins/replication');

	const replicationState = await replicateRxCollection({
		collection: db[collection],
		replicationIdentifier: `my-${collection}-replication`,
		// retryTime
		pull: {
			async handler(latestPullDocument): Promise<{ documents: any; hasMoreDocuments: boolean }> {
				let res;
				try {
					const limitPerPull = 10;
					const minTimestamp = latestPullDocument ? latestPullDocument.updatedAt : 0;

					res = await bt.sendMessage(
						macAddress,
						{
							action: 'get',
							data: '',
							params: {
								updatedSince: minTimestamp,
								limit: limitPerPull,
								collection: collection //eg. notes
							}
						},
						{ timeoutMs: 5 * 1000 }
					);
				} catch (e) {
					console.log(e);
					res = [];
				}
				return { documents: res, hasMoreDocuments: false };
			}
		},
		push: {
			batchSize: 5,
			async handler(docs): Promise<void> {
				try {
					const res = await bt.sendMessage(
						macAddress,
						{
							action: 'put',
							data: docs,
							params: {
								collection: collection //eg. notes
							}
						},
						{ timeoutMs: 5 * 1000 }
					);
				} catch (e) {
					console.log(e);
				}
				return;
			}
		},
		live: live //false=do one time replication, true=continuously sync changes
	});
	replicationState.cancel();
	console.log('replication state', replicationState);
	return replicationState;
};
