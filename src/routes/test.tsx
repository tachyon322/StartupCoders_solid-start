
async function getData() {
  console.log("getData");
}

getData();

export default function test() {
  return (
    <div>test: {import.meta.env.VITE_UPLOADTHING_TOKEN}
    <p>env: {import.meta.env.VITE_DATABASE_URL}</p>
    </div>
  )
}
