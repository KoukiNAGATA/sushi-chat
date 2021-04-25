import redis, { ClientOpts } from "redis";

const redisURL = (process.env.REDIS_URL as ClientOpts) || undefined;
const client = redis.createClient(
  "redis://:pa1885efb99390f5b2c09451f5e40afb2b96212b11ed133a556d3e50980b5ca34@ec2-34-232-148-128.compute-1.amazonaws.com:20239"
);

export function saveRedis(key: string, val: string) {
  client.set(key, val, (error, result) => {
    if (error) {
      console.log(error, result);
    }
  });
}

export function getRedis(key: string) {
  client.get(key, (error, result) => {
    if (error) {
      console.log(error, result);
    }
  });
}

export function delKey(key: string) {
  client.del(key);
}

export function saveObjectRedis(mainKey: string, val: { [key: string]: any }) {
  for (let valKey in val) {
    client.hset(mainKey, valKey, val[valKey].toString(), (error, result) => {
      if (error) {
        console.log(error, result);
      }
    });
  }
}

export function getObjectRedis(
  mainKey: string
): {
  [key: string]: string;
} {
  client.hgetall(mainKey, (error, result) => {
    if (error) {
      console.log(error, result);
    } else {
      return result;
    }
  });
  return {};
}
