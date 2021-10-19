import {Pool} from 'pg'

const pool = new Pool({
   user:'uyntx37idx2phfp34zi6',
   host:'bhgukr5iyylwz58gn7m4-postgresql.services.clever-cloud.com',
   password:'gxLiidI1R5vghEJRLob1',
   database:'bhgukr5iyylwz58gn7m4',
   port:5432
});


module.exports =pool;