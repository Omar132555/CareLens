<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleComment;
use App\Models\ArticleLike;
use App\Models\ArticleSave;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ArticleController extends Controller
{
    /* ─────────────────────────────────────────────────────────
     |  PUBLIC / SHARED ENDPOINTS
     ──────────────────────────────────────────────────────── */

    /**
     * GET /api/articles
     * All published articles with like/save state for authenticated user.
     */
    public function index(Request $request)
    {
        $query = Article::with(['doctor:id,name,profile_photo', 'likes', 'saves'])
            ->orderByDesc('published_at');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $articles = $query->get()->map(fn($a) => $this->formatArticle($a));

        return response()->json($articles);
    }

    /**
     * GET /api/articles/{id}
     */
    public function show($id)
    {
        $article = Article::with([
            'doctor:id,name,profile_photo',
            'likes',
            'saves',
            'comments' => fn($q) => $q->with('user:id,name,profile_photo')->orderByDesc('created_at'),
        ])->findOrFail($id);

        return response()->json($this->formatArticle($article, true));
    }

    /**
     * POST /api/articles/{id}/like  — toggle
     */
    public function like($id)
    {
        $article = Article::findOrFail($id);
        $userId  = Auth::id();

        $existing = ArticleLike::where('article_id', $id)->where('user_id', $userId)->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            ArticleLike::create(['article_id' => $id, 'user_id' => $userId]);
            $liked = true;
        }

        return response()->json([
            'liked'       => $liked,
            'likes_count' => ArticleLike::where('article_id', $id)->count(),
        ]);
    }

    /**
     * POST /api/articles/{id}/save  — toggle
     */
    public function save($id)
    {
        $article = Article::findOrFail($id);
        $userId  = Auth::id();

        $existing = ArticleSave::where('article_id', $id)->where('user_id', $userId)->first();

        if ($existing) {
            $existing->delete();
            $saved = false;
        } else {
            ArticleSave::create(['article_id' => $id, 'user_id' => $userId]);
            $saved = true;
        }

        return response()->json([
            'saved'       => $saved,
            'saves_count' => ArticleSave::where('article_id', $id)->count(),
        ]);
    }

    /**
     * POST /api/articles/{id}/comment
     */
    public function comment(Request $request, $id)
    {
        $request->validate(['content' => 'required|string|max:1000']);

        Article::findOrFail($id);

        $comment = ArticleComment::create([
            'article_id' => $id,
            'user_id'    => Auth::id(),
            'content'    => $request->content,
        ]);

        $comment->load('user:id,name,profile_photo');

        return response()->json([
            'id'         => $comment->id,
            'content'    => $comment->content,
            'user'       => $comment->user,
            'created_at' => $comment->created_at,
        ], 201);
    }

    /**
     * GET /api/articles/saved  — patient's saved articles
     */
    public function savedArticles()
    {
        $articleIds = ArticleSave::where('user_id', Auth::id())->pluck('article_id');
        $articles   = Article::with(['doctor:id,name,profile_photo', 'likes', 'saves'])
            ->whereIn('id', $articleIds)
            ->orderByDesc('published_at')
            ->get()
            ->map(fn($a) => $this->formatArticle($a));

        return response()->json($articles);
    }

    /* ─────────────────────────────────────────────────────────
     |  DOCTOR-ONLY ENDPOINTS
     ──────────────────────────────────────────────────────── */

    /**
     * GET /api/doctor/articles  — own articles
     */
    public function doctorIndex()
    {
        $articles = Article::where('doctor_id', Auth::id())
            ->withCount(['likes', 'comments', 'saves'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($articles);
    }

    /**
     * POST /api/doctor/articles
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'    => 'required|string|max:255',
            'content'  => 'required|string',
            'category' => 'required|string|max:100',
            'image'    => 'nullable|image|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('articles', 'public');
            $imagePath = Storage::url($imagePath);
        }

        $article = Article::create([
            'doctor_id'    => Auth::id(),
            'title'        => $request->title,
            'content'      => $request->content,
            'category'     => $request->category,
            'image'        => $imagePath,
            'published_at' => now(),
        ]);

        return response()->json($article, 201);
    }

    /**
     * PUT /api/doctor/articles/{id}
     */
    public function update(Request $request, $id)
    {
        $article = Article::where('doctor_id', Auth::id())->findOrFail($id);

        $request->validate([
            'title'    => 'sometimes|required|string|max:255',
            'content'  => 'sometimes|required|string',
            'category' => 'sometimes|required|string|max:100',
            'image'    => 'nullable|image|max:5120',
        ]);

        $data = $request->only(['title', 'content', 'category']);

        if ($request->hasFile('image')) {
            $imagePath     = $request->file('image')->store('articles', 'public');
            $data['image'] = Storage::url($imagePath);
        }

        $article->update($data);

        return response()->json($article);
    }

    /**
     * DELETE /api/doctor/articles/{id}
     */
    public function destroy($id)
    {
        $article = Article::where('doctor_id', Auth::id())->findOrFail($id);
        $article->delete();

        return response()->json(['message' => 'Article deleted successfully.']);
    }

    /* ─────────────────────────────────────────────────────────
     |  HELPERS
     ──────────────────────────────────────────────────────── */

    private function formatArticle(Article $a, bool $withComments = false): array
    {
        $userId = Auth::id();
        $data   = [
            'id'           => $a->id,
            'title'        => $a->title,
            'content'      => $a->content,
            'category'     => $a->category,
            'image'        => $a->image,
            'published_at' => $a->published_at,
            'doctor'       => $a->doctor,
            'doctor_id'    => $a->doctor_id,
            'likes_count'  => $a->likes->count(),
            'saves_count'  => $a->saves->count(),
            'is_liked'     => $userId ? $a->likes->where('user_id', $userId)->isNotEmpty() : false,
            'is_saved'     => $userId ? $a->saves->where('user_id', $userId)->isNotEmpty() : false,
        ];

        if ($withComments) {
            $data['comments']       = $a->comments;
            $data['comments_count'] = $a->comments->count();
        }

        return $data;
    }
}
