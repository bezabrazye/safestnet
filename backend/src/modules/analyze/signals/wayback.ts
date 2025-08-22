export async function queryWayback(url: string) {
  try {
    const response = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Wayback Machine API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.archived_snapshots?.closest?.available) {
      const snapshot = data.archived_snapshots.closest;
      const snapshotDate = new Date(snapshot.timestamp);
      const now = new Date();
      const daysSinceSnapshot = Math.floor((now.getTime() - snapshotDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        available: true,
        firstSeen: snapshot.timestamp,
        lastSeen: snapshot.timestamp,
        daysSinceSnapshot,
        snapshotUrl: snapshot.url,
        status: snapshot.status
      };
    }

    return {
      available: false,
      firstSeen: null,
      lastSeen: null,
      daysSinceSnapshot: null,
      snapshotUrl: null,
      status: 'not_archived'
    };
  } catch (error) {
    console.error('Wayback Machine API request failed:', error);
    return null;
  }
}
