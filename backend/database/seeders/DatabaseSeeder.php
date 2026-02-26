<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'middle_name' => null,
            'email' => 'test@example.com',
            'username' => 'test.user',
            'access_type' => 'admin',
            'is_active' => true,
            'is_authorized' => true,
        ]);
    }
}
