'use client';

import { useEffect, useState } from 'react';

// Define the type for the customer object
interface Link {
  rel: string;
  href: string;
}

interface Customer {
  id: string;
  links: Link[];
}

interface CustomerResponse {
  items: Customer[];
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/netsuite'); // Use the new API route
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data: CustomerResponse = await response.json();
        if (data.items) {
          setCustomers(data.items);
        } else {
          setCustomers([]); // Ensure state is empty if no customers found
        }
      } catch (err: any) {
        setError(`Error fetching customers: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false); // Stop loading after the request completes
      }
    };

    fetchCustomers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (customers.length === 0) return <p>No customers available.</p>;

  return (
    <div>
      <h1>NetSuite Customers</h1>
      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>
            ID: {customer.id} |{' '}
            {customer.links && customer.links.length > 0 ? (
              <a href={customer.links[0].href} target="_blank" rel="noopener noreferrer">
                Details
              </a>
            ) : (
              'No Links Available'
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
