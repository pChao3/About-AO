import Link from 'next/link';

function Navlinks() {
  return (
    <>
      {/* <li className="mr-2"><Link href="/features">Features</Link></li> */}
      <li className="mr-2">
        <Link href="/balances">Balances</Link>
      </li>
      {/* <li className="mr-2"><Link href="/blogs">Blogs</Link></li> */}
      <li className="mr-2">
        <Link href="/activity">Activity</Link>
      </li>
      <li className="mr-2">
        <Link href="/others">Others</Link>
      </li>
    </>
  );
}

export default Navlinks;
