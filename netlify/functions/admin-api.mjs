const json=(statusCode,body)=>({statusCode,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify(body)});
export async function handler(event){
  if(event.httpMethod!=="GET")return json(405,{error:"Method not allowed."});
  const suppliedKey=event.headers["x-dungeon-admin-key"];
  const expectedKey=process.env.DUNGEON_ADMIN_KEY;
  if(!expectedKey)return json(500,{error:"Administrator access is not configured."});
  if(!suppliedKey||suppliedKey!==expectedKey)return json(401,{error:"Unauthorized administrator request."});
  const supabaseUrl=process.env.SUPABASE_URL;
  const serviceRoleKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!supabaseUrl||!serviceRoleKey)return json(500,{error:"Crawler registry is not configured."});
  const action=event.queryStringParameters?.action||"list";
  if(action==="status")return json(200,{status:"authorized"});
  if(action!=="list")return json(400,{error:"Unknown administrator action."});
  const requestedLimit=Number(event.queryStringParameters?.limit||100);
  const limit=Math.max(1,Math.min(250,requestedLimit));
  const endpoint=`${supabaseUrl.replace(/\/$/,"")}/rest/v1/crawler_profiles?select=crawler_number,crawler_name,profile,created_at&order=created_at.desc&limit=${limit}`;
  try{
    const response=await fetch(endpoint,{headers:{apikey:serviceRoleKey,Authorization:`Bearer ${serviceRoleKey}`}});
    if(!response.ok){const detail=await response.text();console.error("Admin crawler lookup failed:",response.status,detail);return json(502,{error:"Crawler registry lookup failed."});}
    return json(200,{crawlers:await response.json()});
  }catch(error){console.error("Admin API failure:",error);return json(502,{error:"Crawler registry could not be reached."});}
}
