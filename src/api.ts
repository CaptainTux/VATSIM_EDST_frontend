
// const baseurl: string = 'http://localhost:5000/backend';
const baseurl: string = 'http://tdls.oakartcc.org/backend';

export async function getEdstData(): Promise<any> {
  return await fetch(`${baseurl}/edst/all`);
}

export async function getEdstEntry(callsign: string): Promise<any> {
  return await fetch(`${baseurl}/edst/entry/${callsign}`);
}

export async function updateEdstEntry(plan_data: any): Promise<any> {
  return await fetch(`${baseurl}/edst/entry/update`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(plan_data)
  });
}

export async function getAarData(artcc: string, cid: string): Promise<any> {
  return await fetch(`${baseurl}/edst/aar/${artcc}/${cid}`);
}

export async function getBoundaryData(artcc: string): Promise<any> {
  return await fetch(`${baseurl}/edst/boundary_data/${artcc}`);
}

export async function getReferenceFixes(artcc: string): Promise<any> {
  return await fetch(`${baseurl}/edst/reference_fixes/${artcc}`);
}